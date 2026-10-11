/** Lazily loaded, depth-sharing miniature layer. Geographic coordinates stay authoritative. */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { Map as LibreMap, CustomLayerInterface, MercatorCoordinate, PointLike } from 'maplibre-gl';
import type { FeatureCollection, Polygon, MultiPolygon } from 'geojson';
import { assetUrl } from './hosting';
import { cylinderFeatureId, dioramaAsset, type DioramaAssetId } from './diorama-catalog';
import type { BuildingInfo } from './street-content';

export interface DioramaActor {
  id: string; asset: DioramaAssetId; position: [number, number]; heading: number;
  moving: boolean; elapsed: number; selected: boolean;
}
interface ActorObject { group: THREE.Group; model: THREE.Object3D; asset: DioramaAssetId; }
type CoordinateFactory = { fromLngLat(position: [number, number], altitude?: number): MercatorCoordinate };
const palette = ['#c9c0a7', '#b98f80', '#d1cbb4', '#a8bab4', '#bea58c'];
const distance = (a:number[],b:number[]) => Math.hypot((a[0]-b[0])*Math.cos(b[1]*Math.PI/180), a[1]-b[1])*111320;

export class DioramaLayer {
  readonly id = 'pyongyang-diorama';
  private scene = new THREE.Scene();
  private camera = new THREE.Camera();
  private renderer?: THREE.WebGLRenderer;
  private models = new Map<DioramaAssetId, THREE.Object3D>();
  private pending = new Set<DioramaAssetId>();
  private failed = new Set<DioramaAssetId>();
  private actors = new Map<string, ActorObject>();
  private buildings: THREE.Object3D[] = [];
  private buildingIds: string[] = [];
  private selectedBuilding = '';
  private buildingHighlight?:THREE.LineSegments<THREE.EdgesGeometry,THREE.LineBasicMaterial>;
  private active = true;
  private disposed = false;
  private abort = new AbortController();
  private geometries = new Set<THREE.BufferGeometry>();
  private materials = new Set<THREE.Material>();
  private textures = new Set<THREE.Texture>();
  private origin: MercatorCoordinate;
  private scale: number;
  private world: THREE.Matrix4;
  private dummy = new THREE.Object3D();
  private shadowGeometry = new THREE.CircleGeometry(1, 20);
  private shadowMaterial = new THREE.MeshBasicMaterial({color:'#36483d',transparent:true,opacity:.18,depthWrite:false});
  private selectionGeometry = new THREE.RingGeometry(.82, 1.02, 32);
  private selectionMaterial = new THREE.MeshBasicMaterial({color:'#eff8c1',transparent:true,opacity:.95,depthWrite:false,side:THREE.DoubleSide});
  private assetNoticeSent = false;
  private actorSignature='';
  private frameStats=0;

  constructor(private map: LibreMap, private coordinate: CoordinateFactory, geometry: FeatureCollection,
    private center: [number,number], private placeId: string, private onFailure: () => void) {
    this.origin = coordinate.fromLngLat(center, 0);
    this.scale = this.origin.meterInMercatorCoordinateUnits();
    this.world = new THREE.Matrix4().makeTranslation(this.origin.x,this.origin.y,this.origin.z)
      .multiply(new THREE.Matrix4().makeScale(this.scale,-this.scale,this.scale))
      .multiply(new THREE.Matrix4().makeRotationX(Math.PI/2));
    this.geometries.add(this.shadowGeometry);this.geometries.add(this.selectionGeometry);
    this.materials.add(this.shadowMaterial);this.materials.add(this.selectionMaterial);
    this.scene.add(new THREE.HemisphereLight('#fff4db','#718570',1.55));
    const sun=new THREE.DirectionalLight('#fff0d5',1.7);sun.position.set(-160,240,110);this.scene.add(sun);
    const fill=new THREE.DirectionalLight('#bdd3df',.55);fill.position.set(140,80,-120);this.scene.add(fill);
    this.buildNeighborhood(geometry);
    const layer: CustomLayerInterface={ id:this.id,type:'custom',renderingMode:'3d',
      onAdd:(_map,context)=>{
        this.renderer=new THREE.WebGLRenderer({canvas:this.map.getCanvas(),context,antialias:true});
        this.renderer.autoClear=false;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure=1.08;
      },
      render:(_context,args)=>{
        if(!this.active||this.disposed||this.map.getZoom()<15||!this.renderer)return;
        this.camera.projectionMatrix.fromArray(args.defaultProjectionData.mainMatrix).multiply(this.world);
        this.camera.projectionMatrixInverse.copy(this.camera.projectionMatrix).invert();
        this.renderer.resetState();this.renderer.render(this.scene,this.camera);this.renderer.resetState();
        if(performance.now()-this.frameStats>1000){this.frameStats=performance.now();const container=this.map.getContainer();container.dataset.drawCalls=String(this.renderer.info.render.calls);container.dataset.triangles=String(this.renderer.info.render.triangles);container.dataset.miniatures=String(this.actors.size);}
      },
      onRemove:()=>this.dispose(),
    };
    this.map.addLayer(layer);
  }
  private local(position:number[]) {
    const point=this.coordinate.fromLngLat([position[0],position[1]],0);
    return new THREE.Vector3((point.x-this.origin.x)/this.scale,0,(point.y-this.origin.y)/this.scale);
  }
  private material(color:string) {
    const material=new THREE.MeshStandardMaterial({color,roughness:.94,metalness:0});
    this.materials.add(material);return material;
  }
  private shadow(parent:THREE.Object3D,width:number,depth:number) {
    const shadow=new THREE.Mesh(this.shadowGeometry,this.shadowMaterial);
    shadow.rotation.x=-Math.PI/2;shadow.scale.set(width,depth,1);shadow.position.y=.04;
    parent.add(shadow);return shadow;
  }
  private buildNeighborhood(geometry:FeatureCollection) {
    const windows: {position:THREE.Vector3;yaw:number;width:number}[]=[];
    const ledges:{position:THREE.Vector3;yaw:number;length:number}[]=[];
    const edgeMaterial=this.material('#e5dcc2');
    const roofMaterial=this.material('#b5b8a5');
    const geometries=geometry.features.filter(feature=>feature.properties?.kind==='building'&&['Polygon','MultiPolygon'].includes(feature.geometry.type))
      .filter(feature=>distance([feature.properties?.longitude,feature.properties?.latitude],this.center)<430)
      .sort((a,b)=>distance([a.properties?.longitude,a.properties?.latitude],this.center)-distance([b.properties?.longitude,b.properties?.latitude],this.center)).slice(0,150);
    for(const feature of geometries){
      const properties=feature.properties as BuildingInfo;
      const id=String(properties.id),isCylinder=id===cylinderFeatureId;
      const height=isCylinder?48:Math.max(3,Math.min(90,Number(properties.height)||15));
      const polygons=feature.geometry.type==='Polygon'?[(feature.geometry as Polygon).coordinates]:(feature.geometry as MultiPolygon).coordinates;
      for(const polygon of polygons){
        const ring=polygon[0].slice(0,-1).map(point=>this.local(point));
        if(ring.length<3)continue;
        const shape=new THREE.Shape(ring.map(point=>new THREE.Vector2(point.x,-point.z)));
        for(const hole of polygon.slice(1))shape.holes.push(new THREE.Path(hole.slice(0,-1).map(point=>{const p=this.local(point);return new THREE.Vector2(p.x,-p.z);})));
        const group=new THREE.Group();
        group.userData.building={...properties,height,heightSource:isCylinder?'illustrative tower heights 36–48 m · not measured':properties.heightSource};
        const geometry=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false,steps:1});
        this.geometries.add(geometry);
        const body=new THREE.Mesh(geometry,this.material(palette[Math.abs(Number(id)||0)%palette.length]));body.rotation.x=-Math.PI/2;group.add(body);
        const roofGeometry=new THREE.ShapeGeometry(shape);this.geometries.add(roofGeometry);
        const roof=new THREE.Mesh(roofGeometry,roofMaterial);roof.rotation.x=-Math.PI/2;roof.position.y=height+.03;group.add(roof);
        const lineGeometry=new THREE.BufferGeometry().setFromPoints([...ring,ring[0]].map(p=>new THREE.Vector3(p.x,height+.08,p.z)));
        this.geometries.add(lineGeometry);const lineMaterial=new THREE.LineBasicMaterial({color:'#f0e6cd'});this.materials.add(lineMaterial);group.add(new THREE.Line(lineGeometry,lineMaterial));
        if(!isCylinder){
          const signed=ring.reduce((sum,p,i)=>{const next=ring[(i+1)%ring.length];return sum+p.x*next.z-next.x*p.z;},0);
          for(let i=0;i<ring.length;i++){
            const a=ring[i],b=ring[(i+1)%ring.length],delta=b.clone().sub(a),length=delta.length();
            const normal=new THREE.Vector3(delta.z,0,-delta.x).normalize().multiplyScalar(signed>0?1:-1);
            for(let floor=1;floor*3.1<height;floor++){if(ledges.length<3500)ledges.push({position:a.clone().lerp(b,.5).addScaledVector(normal,.08).setY(floor*3.1),yaw:Math.atan2(normal.x,normal.z),length});}
            ledges.push({position:a.clone().lerp(b,.5).setY(height+.15),yaw:Math.atan2(normal.x,normal.z),length});
            const count=Math.min(24,Math.floor(length/3.8)),floors=Math.min(20,Math.floor((height-1)/3.1));
            for(let floor=0;floor<floors;floor++)for(let column=0;column<count;column++){
              if(windows.length>=12000)break;
              const position=a.clone().lerp(b,(column+.5)/count).addScaledVector(normal,.10);position.y=2+floor*3.1;
              windows.push({position,yaw:Math.atan2(normal.x,normal.z),width:Math.min(1.35,length/count*.38)});
            }
          }
          // A visible ground entrance is an illustrative façade element, never a surveyed door.
          const a=ring[0],b=ring[1],entry=a.clone().lerp(b,.5);
          const box=new THREE.BoxGeometry(2.1,2.6,.18);this.geometries.add(box);
          const door=new THREE.Mesh(box,edgeMaterial);door.position.set(entry.x,1.3,entry.z);door.rotation.y=Math.atan2(b.x-a.x,b.z-a.z)+Math.PI/2;group.add(door);
        }else{
          void this.load('apartment-cylinder').then(model=>{
            if(!model||this.disposed)return;
            const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3());
            // The reviewed OSM feature is three linked circular towers, not one bounding-box cylinder.
            // Arc ranges were reviewed against the retained 85-vertex footprint and exterior photograph.
            if(ring.length!==84)return;
            const arcs=[[0,9,18,36],[26,36,46,48],[54,64,74,36]];
            const core=new THREE.Shape([...ring.slice(18,27),...ring.slice(46,55),...ring.slice(74,84)].map(point=>new THREE.Vector2(point.x,-point.z)));
            for(const [first,middle,last,towerHeight] of arcs){
              const a=ring[first],b=ring[middle],c=ring[last];
              const d=2*(a.x*(b.z-c.z)+b.x*(c.z-a.z)+c.x*(a.z-b.z));
              const aa=a.x*a.x+a.z*a.z,bb=b.x*b.x+b.z*b.z,cc=c.x*c.x+c.z*c.z;
              const x=(aa*(b.z-c.z)+bb*(c.z-a.z)+cc*(a.z-b.z))/d;
              const z=(aa*(c.x-b.x)+bb*(a.x-c.x)+cc*(b.x-a.x))/d;
              const radius=Math.hypot(a.x-x,a.z-z);

              const clone=model.clone(true);clone.position.set(x,0,z);clone.scale.set(radius*2/size.x,towerHeight/size.y,radius*2/size.x);group.add(clone);
            }
            const connectorGeometry=new THREE.ExtrudeGeometry(core,{depth:32,bevelEnabled:false,steps:1});this.geometries.add(connectorGeometry);
            const connector=new THREE.Mesh(connectorGeometry,this.material('#c7bfa6'));connector.rotation.x=-Math.PI/2;group.add(connector);
            group.remove(body);group.remove(roof);group.children.filter(child=>child instanceof THREE.Line).forEach(child=>group.remove(child));
            group.userData.building.height=48;group.userData.building.heightSource='illustrative tower heights 36–48 m · not measured';
            this.map.triggerRepaint();
          });
        }
        // Directional contact shading is intentionally light, without a costly shadow map.
        const shadowGeometry=new THREE.ShapeGeometry(shape);this.geometries.add(shadowGeometry);
        const shadow=new THREE.Mesh(shadowGeometry,this.shadowMaterial);shadow.rotation.x=-Math.PI/2;shadow.position.set(2,.06,-2);shadow.scale.set(1.01,1.01,1);this.scene.add(shadow);
        this.scene.add(group);this.buildings.push(group);
      }
      this.buildingIds.push(id);
    }
    // Static geometry is batched by material; original groups remain precise picking geometry.
    const batches=new Map<string,{material:THREE.Material;geometries:THREE.BufferGeometry[]}>();
    const edges:THREE.BufferGeometry[]=[];
    for(const child of [...this.scene.children]){
      if(!(child instanceof THREE.Group)&&!(child instanceof THREE.Mesh))continue;
      if(child.userData.building&&String(child.userData.building.id)===cylinderFeatureId)continue;
      child.updateMatrixWorld(true);
      child.traverse(object=>{
        if(object instanceof THREE.Mesh&&!Array.isArray(object.material)){
          const material=object.material as THREE.MeshStandardMaterial;
          const key=`${material.type}:${material.color.getHex()}:${material.transparent}`;
          const transformed=(object.geometry.index?object.geometry.toNonIndexed():object.geometry.clone()).applyMatrix4(object.matrixWorld);this.geometries.add(transformed);
          const batch=batches.get(key)||{material,geometries:[]};batch.geometries.push(transformed);batches.set(key,batch);
        }else if(object instanceof THREE.Line){
          const points=object.geometry.getAttribute('position');const vertices:number[]=[];
          for(let i=1;i<points.count;i++)vertices.push(points.getX(i-1),points.getY(i-1),points.getZ(i-1),points.getX(i),points.getY(i),points.getZ(i));
          const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.applyMatrix4(object.matrixWorld);this.geometries.add(geometry);edges.push(geometry);
        }
      });
      this.scene.remove(child);
    }
    for(const batch of batches.values()){
      const merged=mergeGeometries(batch.geometries);if(!merged)continue;
      this.geometries.add(merged);this.scene.add(new THREE.Mesh(merged,batch.material));
    }
    if(edges.length){const merged=mergeGeometries(edges)!;this.geometries.add(merged);const material=new THREE.LineBasicMaterial({color:'#e4d8ba'});this.materials.add(material);this.scene.add(new THREE.LineSegments(merged,material));}
    const windowGeometry=new THREE.BoxGeometry(1,1.55,.11);this.geometries.add(windowGeometry);
    const windowsMesh=new THREE.InstancedMesh(windowGeometry,this.material('#526d71'),windows.length);
    windows.forEach((window,index)=>{this.dummy.position.copy(window.position);this.dummy.rotation.set(0,window.yaw,0);this.dummy.scale.set(window.width,1,1);this.dummy.updateMatrix();windowsMesh.setMatrixAt(index,this.dummy.matrix);});
    windows.forEach((_,i)=>windowsMesh.setColorAt(i,new THREE.Color(['#718b89','#445f66','#92a7a1','#536a74'][i%4])));
    this.scene.add(windowsMesh);
    const frameGeometry=new THREE.BoxGeometry(1,1.9,.07);this.geometries.add(frameGeometry);
    const frames=new THREE.InstancedMesh(frameGeometry,this.material('#dfd8c4'),windows.length);
    windows.forEach((window,index)=>{this.dummy.position.copy(window.position);this.dummy.position.x-=Math.sin(window.yaw)*.04;this.dummy.position.z-=Math.cos(window.yaw)*.04;this.dummy.rotation.set(0,window.yaw,0);this.dummy.scale.set(window.width+.3,1,1);this.dummy.updateMatrix();frames.setMatrixAt(index,this.dummy.matrix);});this.scene.add(frames);
    const ledgeGeometry=new THREE.BoxGeometry(1,.22,.45);this.geometries.add(ledgeGeometry);
    const courses=new THREE.InstancedMesh(ledgeGeometry,this.material('#cfc7ad'),ledges.length);
    ledges.forEach((ledge,index)=>{this.dummy.position.copy(ledge.position);this.dummy.rotation.set(0,ledge.yaw,0);this.dummy.scale.set(ledge.length,1,1);this.dummy.updateMatrix();courses.setMatrixAt(index,this.dummy.matrix);});this.scene.add(courses);
    // Imagined greenery and street furniture follow mapped roads, with deterministic spacing.
    const roads=geometry.features.filter(f=>f.properties?.kind==='road'&&f.geometry.type==='LineString'&&!['trunk','motorway','steps'].includes(f.properties.highway))
      .filter(f=>f.geometry.type==='LineString'&&f.geometry.coordinates.some(p=>distance(p,this.center)<260)).slice(0,12);
    const treePositions:THREE.Vector3[]=[];
    for(const road of roads){if(road.geometry.type!=='LineString')continue;
      for(let i=1;i<road.geometry.coordinates.length;i++){
        const a=this.local(road.geometry.coordinates[i-1]),b=this.local(road.geometry.coordinates[i]);
        const length=a.distanceTo(b),normal=new THREE.Vector3(b.z-a.z,0,a.x-b.x).normalize();
        for(let step=18;step<length;step+=38){
          const position=a.clone().lerp(b,step/length).addScaledVector(normal,8);
          if(position.length()>320||treePositions.length>=36)continue;
          if(this.buildings.some(building=>new THREE.Box3().setFromObject(building).expandByScalar(3).containsPoint(position.clone().setY(1))))continue;
          treePositions.push(position);
        }
      }
    }
    void this.load('tree').then(model=>{if(!model||this.disposed)return;treePositions.forEach((position,i)=>{const clone=model.clone(true);clone.position.copy(position);clone.rotation.y=i*1.73;clone.scale.setScalar(.8+i%3*.1);this.scene.add(clone);this.shadow(clone,2.4,2.4);});this.map.triggerRepaint();});
    const road=roads.find(f=>f.geometry.type==='LineString'&&f.geometry.coordinates.some(p=>distance(p,this.center)<60));
    if(road?.geometry.type==='LineString'){
      const nearest=road.geometry.coordinates.reduce((best,p)=>distance(p,this.center)<distance(best,this.center)?p:best);
      const props:DioramaAssetId[]=this.placeId==='pyongyang-transit'?['shelter','bench','streetlamp']:['bench','streetlamp'];
      props.forEach((asset,i)=>void this.load(asset).then(model=>{if(!model||this.disposed)return;
        const clone=model.clone(true);clone.position.copy(this.local(nearest)).add(new THREE.Vector3(8,0,5+i*12));this.scene.add(clone);this.map.triggerRepaint();
      }));
    }
  }
  private async load(asset:DioramaAssetId):Promise<THREE.Object3D|null> {
    if(this.models.has(asset))return this.models.get(asset)!;
    if(this.failed.has(asset)||this.pending.has(asset))return null;
    this.pending.add(asset);
    try{
      const response=await fetch(assetUrl(dioramaAsset(asset).model),{signal:this.abort.signal});
      if(!response.ok)throw new Error('Model unavailable');
      const gltf=await new GLTFLoader().parseAsync(await response.arrayBuffer(),'');
      const model=gltf.scene;
      model.traverse(object=>{
        if(!(object instanceof THREE.Mesh))return;
        this.geometries.add(object.geometry);
        const materials=Array.isArray(object.material)?object.material:[object.material];
        for(const material of materials){this.materials.add(material);for(const value of Object.values(material))if(value instanceof THREE.Texture)this.textures.add(value);}
      });
      if(this.disposed){this.releaseResources();return null;}
      this.models.set(asset,model);this.actorSignature='';this.map.triggerRepaint();return model;
    }catch{
      if(!this.disposed){this.failed.add(asset);if(!this.assetNoticeSent){this.assetNoticeSent=true;this.onFailure();}}
      return null;
    }finally{this.pending.delete(asset);}
  }
  setActive(active:boolean) {
    if(this.active===active)return;this.active=active;
    this.map.setFilter('buildings',active?['all',['==',['get','kind'],'building'],['!', ['in',['get','id'],['literal',this.buildingIds]]]]:['==',['get','kind'],'building']);
    this.map.triggerRepaint();
  }
  activate() {
    this.map.setFilter('buildings',['all',['==',['get','kind'],'building'],['!', ['in',['get','id'],['literal',this.buildingIds]]]]);
  }
  updateActors(states:DioramaActor[]) {
    if(!this.active)states=[];
    const signature=JSON.stringify(states);if(signature===this.actorSignature)return;this.actorSignature=signature;
    const wanted=new Set(states.map(state=>state.id));
    this.actors.forEach((object,id)=>{if(!wanted.has(id)){this.scene.remove(object.group);this.actors.delete(id);}});
    for(const state of states){
      let object=this.actors.get(state.id);
      if(!object){
        const model=this.models.get(state.asset);
        if(!model){void this.load(state.asset);continue;}
        const group=new THREE.Group(),clone=model.clone(true);
        const person=['resident','commuter','porter','vendor'].includes(state.asset);
        const scale=person?2.5:state.asset==='cyclist'?1.65:1.15;
        clone.scale.setScalar(scale);group.add(clone);
        const box=new THREE.Box3().setFromObject(clone).getSize(new THREE.Vector3());
        this.shadow(group,Math.max(.5,box.x*.6),Math.max(.5,box.z*.6));
        const ring=new THREE.Mesh(this.selectionGeometry,this.selectionMaterial);ring.rotation.x=-Math.PI/2;ring.position.y=.1;ring.scale.setScalar(Math.max(1.6,box.x*.7));ring.name='selection-ring';group.add(ring);
        group.userData.actorId=state.id;this.scene.add(group);object={group,model:clone,asset:state.asset};this.actors.set(state.id,object);
      }
      object.group.position.copy(this.local(state.position));object.group.rotation.y=state.heading;
      object.group.getObjectByName('selection-ring')!.visible=state.selected;
      for(const [name,sign] of [['leg-left',1],['leg-right',-1],['arm-left',-1],['arm-right',1]] as const){
        let limb:THREE.Object3D|undefined;object.model.traverse(node=>{if(node.userData.motionPart===name||node.name===name)limb=node;});if(limb){const holding=name.startsWith('arm')&&['porter','cyclist'].includes(state.asset);limb.rotation.x=state.moving&&!holding?Math.sin(state.elapsed*7)*.32*sign:0;}
      }
    }
    this.map.triggerRepaint();
  }
  hasActor(id:string) {return this.active&&this.actors.has(id);}
  selectBuilding(id?:string) {
    if(this.selectedBuilding===(id||''))return;this.selectedBuilding=id||'';
    if(this.buildingHighlight){
      this.scene.remove(this.buildingHighlight);
      this.buildingHighlight.geometry.dispose();this.geometries.delete(this.buildingHighlight.geometry);
      this.buildingHighlight.material.dispose();this.materials.delete(this.buildingHighlight.material);
      this.buildingHighlight=undefined;
    }
    const building=this.buildings.find(group=>String(group.userData.building.id)===this.selectedBuilding);
    if(building){
      const box=new THREE.Box3().setFromObject(building);const bounds=new THREE.BoxGeometry(box.max.x-box.min.x,box.max.y-box.min.y,box.max.z-box.min.z);const geometry=new THREE.EdgesGeometry(bounds);bounds.dispose();this.geometries.add(geometry);
      const material=new THREE.LineBasicMaterial({color:'#edf6c7'});this.materials.add(material);const highlight=new THREE.LineSegments(geometry,material);highlight.position.copy(box.getCenter(new THREE.Vector3()));this.scene.add(highlight);this.buildingHighlight=highlight;
    }
    this.map.triggerRepaint();
  }
  nearestBuilding():BuildingInfo|null {
    if(!this.active)return null;const center=this.map.getCenter();
    const groups=[...this.buildings].sort((a,b)=>distance([a.userData.building.longitude,a.userData.building.latitude],[center.lng,center.lat])-distance([b.userData.building.longitude,b.userData.building.latitude],[center.lng,center.lat]));
    return groups[0]?.userData.building||null;
  }
  private ray(point:PointLike) {
    const position=Array.isArray(point)?{x:point[0],y:point[1]}:point;
    const width=this.map.getContainer().clientWidth,height=this.map.getContainer().clientHeight;
    const x=position.x/width*2-1,y=1-position.y/height*2;
    const near=new THREE.Vector3(x,y,-1).unproject(this.camera),far=new THREE.Vector3(x,y,1).unproject(this.camera);
    return new THREE.Raycaster(near,far.sub(near).normalize());
  }
  pickBuilding(point:PointLike):BuildingInfo|null {
    if(!this.active)return null;
    const hit=this.ray(point).intersectObjects(this.buildings,true)[0];
    let object:THREE.Object3D|null=hit?.object||null;while(object){if(object.userData.building)return object.userData.building;object=object.parent;}
    return null;
  }
  occluded(position:[number,number]) {
    if(!this.active)return false;
    const ground=this.local(position);ground.y=2;
    const clip=ground.clone().project(this.camera),width=this.map.getContainer().clientWidth,height=this.map.getContainer().clientHeight;
    const ray=this.ray([(clip.x+1)*width/2,(1-clip.y)*height/2]);
    const hit=ray.intersectObjects(this.buildings,true)[0];return !!hit&&hit.distance<ray.ray.origin.distanceTo(ground)-.8;
  }
  private releaseResources() {
    this.geometries.forEach(geometry=>geometry.dispose());this.materials.forEach(material=>material.dispose());
    this.textures.forEach(texture=>{texture.dispose();const image=texture.image as {close?:()=>void}|undefined;image?.close?.();});
    this.geometries.clear();this.materials.clear();this.textures.clear();
  }
  dispose() {
    if(this.disposed)return;this.disposed=true;this.abort.abort();this.releaseResources();
    this.scene.clear();this.actors.clear();this.models.clear();this.renderer?.dispose();
  }
}
