import type { Feature, FeatureCollection, LineString } from 'geojson';
import { placeById, sources } from './content';
import type { Exploration } from './exploration';
import { pedestrianMotion, type PedestrianPlan } from './street-simulation';
import { reconstructionClaim, scenarioFor, type StreetEntity, type StreetEntityType } from './street-content';

function distance(a: number[], b: number[]) {
  return Math.hypot((a[0]-b[0])*Math.cos(b[1]*Math.PI/180),a[1]-b[1])*111320;
}
function nearestRoute(geometry: FeatureCollection, center: [number,number], kind: 'road'|'rail', driving=false) {
  const candidates=geometry.features.flatMap(feature=>{
    if(feature.properties?.kind!==kind||feature.geometry.type!=='LineString')return [];
    if(driving&&['footway','path','steps','pedestrian','cycleway'].includes(feature.properties.highway))return [];
    if(!driving&&['motorway','motorway_link','trunk','trunk_link','steps'].includes(feature.properties.highway))return [];
    const coordinates=feature.geometry.coordinates;
    if(coordinates.length<2||coordinates.some(p=>!Number.isFinite(p[0])||!Number.isFinite(p[1])))return [];
    let length=0,nearest=Infinity,along=0;
    const cosine=Math.cos(center[1]*Math.PI/180);
    for(let i=1;i<coordinates.length;i++){
      const a=coordinates[i-1],b=coordinates[i];
      const ax=(a[0]-center[0])*cosine,ay=a[1]-center[1],dx=(b[0]-a[0])*cosine,dy=b[1]-a[1];
      const t=Math.max(0,Math.min(1,-(ax*dx+ay*dy)/(dx*dx+dy*dy||1)));
      const separation=Math.hypot(ax+t*dx,ay+t*dy)*111320,segment=distance(a,b);
      if(separation<nearest){nearest=separation;along=length+t*segment;}
      length+=segment;
    }
    return length>=25&&nearest<=550?[{feature:feature as Feature<LineString>,length,nearest,along}]:[];
  });
  return candidates.sort((a,b)=>a.nearest-b.nearest||String(a.feature.properties?.id).localeCompare(String(b.feature.properties?.id)))[0];
}

export function planStreetEntities(state: Exploration, geometry: FeatureCollection, center: [number,number]): StreetEntity[] {
  const place=placeById(state.placeId);
  if(!place||state.view!=='street'||state.sceneId||distance(center,place.coordinates)>900)return [];
  const scenario=scenarioFor(place.id,state.year,state.scenarioId);
  if(!scenario)return [];
  const entities:StreetEntity[]=[];
  const mapSource=place.regionId==='dmz'||place.id==='kim-il-sung-square'?'military-osm':'osm';
  const contextSources=scenario.sourceIds.filter(id=>sources.some(s=>s.id===id));
  const claims=[reconstructionClaim,{element:'Geographic reference',level:'Inferred' as const,description:'Contemporary mapped geometry anchors this illustration. It does not establish historical occupancy, routes or appearance.',sourceIds:[mapSource]}];
  const add=(type:StreetEntityType,title:string,description:string,options:Partial<StreetEntity>={})=>{
    const entity:StreetEntity={id:`${place.id}:${scenario.id}:${type}:${entities.filter(e=>e.type===type).length}`,type,category:['soldier','vendor','porter'].includes(type)?'people':['workbench','conference','panmungak','boundary'].includes(type)?'places':'transport',title,description,period:scenario.period,position:place.coordinates,claims:[...claims],...options};
    entities.push(entity);return entity;
  };
  const moving=(type:StreetEntityType,title:string,description:string,speed:number,sprite:string,kind:'road'|'rail'='road',slot=0)=>{
    const route=nearestRoute(geometry,center,kind,['bus','truck','tank'].includes(type));
    if(!route)return;
    const entity=add(type,title,description,{sprite,route:route.feature.geometry.coordinates,speed,offset:Math.max(0,Math.min(route.length,route.along+slot*22))/speed});
    entity.position=streetEntityMotion(entity,0).position;
    return entity;
  };
  if(place.regionId==='dmz'){
    const armed=scenario.id==='jsa-guard'||scenario.id==='jsa-before';
    for(const [i,position] of ([[126.67750,37.956055],[126.67758,37.956050]] as [number,number][]).entries()){
      add('soldier',armed?'An imagined guard':'An imagined unarmed guard','A fictional guard at a public landmark. Position, duty and thought are reconstructed; no real individual or operational patrol is represented.',{position,sprite:`/sprites/soldier-${armed?'armed':'unarmed'}.png`,role:'A border guard',activity:armed?'Waiting near Panmungak in a guard scenario':'Standing near Panmungak after the recorded demilitarization',thoughts:['I should keep my attention on the task in front of me.','Standing still makes this moment feel longer.','I will stretch my legs when this pause is over.'],claims:[...claims,{element:'Guard context',level:'Inferred',description:scenario.description,sourceIds:contextSources}],id:`${place.id}:${scenario.id}:guard:${i}`});
    }
    add('panmungak','Panmungak','The North Korean building overlooking the conference area. Its exterior is visible in the reference photograph; its interior and current occupants are not represented.',{position:[126.6774893,37.9562418],photograph:'/scenes/panmunjom.webp',photographSourceId:'jsa-photo',claims:[...claims,{element:'Visible landmark exterior',level:'Observed',description:'The named landmark is visible in the June 2018 reference. This does not establish historical height, interiors or staffing.',sourceIds:['jsa-photo']}]});
    add('conference','The blue conference buildings','Publicly documented conference buildings around the Military Demarcation Line. Choose the photograph to inspect the observed exterior.',{position:[126.6769458,37.9558963],photograph:'/scenes/panmunjom.webp',photographSourceId:'jsa-photo',claims:[...claims,{element:'Visible landmark exterior',level:'Observed',description:'The named landmark is visible in the June 2018 reference. This does not establish historical height, interiors or staffing.',sourceIds:['jsa-photo']}]});
    add('boundary','Across a small line','This approximate interpretive point introduces the Military Demarcation Line around the conference buildings. It is not a surveyed boundary or a claim about unrestricted access.',{position:[126.6769183,37.9559424],photograph:'/scenes/panmunjom.webp',photographSourceId:'jsa-photo',claims:[...claims,{element:'Mapped demarcation alignment',level:'Inferred',description:'The displayed line follows contemporary mapped alignment. This interpretive marker is not a surveyed legal boundary or a route.',sourceIds:['jsa-mdl-map']}]});
    return entities;
  }
  if(place.id==='kim-il-sung-square'){
    if(scenario.id!=='parade-2015')return entities;
    // The image identifies an armored parade vehicle, not an exact tank model.
    if(sources.some(s=>s.id==='tank-photo'))for(let i=0;i<2;i++){
      const tank=moving('tank','A reconstructed parade tank','A generic tank miniature for the documented parade context. The linked image shows an armored parade vehicle; exact model, dimensions and this route are unverified.',3,'/sprites/tank.png','road',i*2);
      if(tank){tank.photograph='/scenes/parade-tank-photo.webp';tank.photographSourceId='tank-photo';tank.claims.push({element:'Equipment and event context',level:'Inferred',description:'Dated parade imagery supplies event context. The generic tank sprite is an illustration, not a model identification or a reconstruction of a particular photographed vehicle.',sourceIds:['parade-event-record','parade-photo','tank-photo']});}
    }
    for(let i=0;i<6;i++){
      const soldier=moving('soldier','An imagined parade participant','A fictional participant in a small illustrative formation. The actual formation size, steps and route are not simulated.',1.2,'/sprites/soldier-armed.png','road',i);
      if(soldier){soldier.role='A parade participant';soldier.activity='Marching in the 10 October 2015 event reconstruction';soldier.thoughts=['I should keep the same pace as the others.','I need to pay attention to the next step.','I wonder how the formation looks from the crowd.'];soldier.claims.push({element:'Recorded event',level:'Inferred',description:'The parade is documented on 10 October 2015. This individual and inner thought are imagined.',sourceIds:['parade-photo']});}
    }
    return entities;
  }
  if(place.regionId==='pyongyang'){
    const bus=moving('bus','An imagined city bus','A possible bus journey inspired by a photographed Pyongyang bus. The service, destinations, timetable and movement are unverified.',5,'/sprites/bus.png');
    if(bus){bus.visualAssetId='bus';bus.photograph='/scenes/bus.webp';bus.photographSourceId='bus-photo';}
    const cyclist=moving('cyclist','A bicycle journey','An illustrative cyclist on the mapped ground. This journey and rider are fictional.',2.6,'/sprites/cyclist.png','road',2);
    if(cyclist){cyclist.visualAssetId='cyclist';cyclist.role='A cyclist';cyclist.activity='Riding along a mapped road';cyclist.thoughts=['A steady pace will get me there.','I should leave enough time for the ride home.'];}
    const porter=moving('porter','Carrying an errand home','A fictional neighbor carrying a small bundle through the neighborhood.',1.1,'/scenes/pedestrian.png','road',3);
    if(porter){porter.visualAssetId='porter';porter.role='A neighbor with a parcel';porter.activity='Carrying a household errand home';porter.thoughts=['I should put this down before starting the next chore.','One more short walk, then I can rest.'];}
    if(place.id==='kwangbok-store'){
      const anchor=nearestRoute(geometry,place.coordinates,'road');
      if(anchor){const point=streetEntityMotion({id:'anchor',type:'cart',category:'transport',title:'',description:'',period:'',position:place.coordinates,claims:[],route:anchor.feature.geometry.coordinates,speed:1,offset:anchor.along},0).position;
        add('vendor','An imagined roadside sale','An illustrative small sales table near the store area. This table, goods and sale are not observations of the department store.',{position:point,visualAssetId:'vendor',sprite:'/sprites/vendor.png',role:'A seller',activity:'Waiting beside an imagined sales table',thoughts:['I should keep the goods neatly arranged.','I wonder what the next visitor will be looking for.'],photograph:'/scenes/store.webp',photographSourceId:'shop-photo'});
      }
    }
  }else{
    moving('truck','Imagined freight transport','An illustrative freight vehicle. The cargo, vehicle design and activity at this exact location are unverified.',4,'/sprites/freight-truck.png');
    moving('cart','A small load of work','A handcart illustration following a mapped road. Its presence and load are reconstructed.',.9,'/sprites/handcart.png','road',2);
    const train=moving('train','Along the freight line','An imagined freight movement on mapped rail geometry. No actual train, cargo or timetable is represented.',3,'/sprites/freight-train.png','rail',1);
    if(train){train.photograph='/scenes/railway.webp';train.photographSourceId='namyang-rail';train.claims.push({element:'Regional railway reference',level:'Inferred',description:'The photograph is Namyang, not Aoji or Haksong. Its original location and reported 2018 date are preserved.',sourceIds:['namyang-rail'],scope:'Regional proxy · Namyang'});}
    const worker=moving('porter','An imagined surface worker','A fictional worker on a short journey. The activity and working conditions have not been established for this particular person.',1.1,'/scenes/pedestrian.png','road',4);
    if(worker){worker.role='A surface worker';worker.activity='Carrying a small load near the industrial area';worker.thoughts=['There is one more task to finish before I leave.','I should put my things away before heading home.'];}
    add('workbench','An imagined work table','A small illustrative work table associated with the prepared work scene. No source establishes this exact equipment or placement.',{position:place.coordinates,photograph:place.id==='aoji-coal'?'/scenes/coal.webp':'/scenes/rail.webp'});
  }
  return entities;
}

export function streetEntityMotion(entity:StreetEntity,elapsed:number){
  if(!entity.route||entity.route.length<2)return {position:entity.position,walking:false,reverse:false};
  const length=entity.route.slice(1).reduce((sum,p,i)=>sum+distance(entity.route![i],p),0);
  if(length<=0)return {position:entity.position,walking:false,reverse:false};
  const plan:PedestrianPlan={index:0,road:entity.route,length,speed:entity.speed||1,offset:entity.offset||0,wait:4,loop:distance(entity.route[0],entity.route.at(-1)!)<1};
  return pedestrianMotion(plan,elapsed);
}
