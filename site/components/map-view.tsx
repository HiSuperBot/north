"use client";
import { useEffect, useRef, useState } from 'react';
import type { Map as LibreMap, Marker, StyleSpecification } from 'maplibre-gl';
import type { FeatureCollection } from 'geojson';
import { places, regions } from '@/lib/content';
import type { Exploration } from '@/lib/exploration';
import { planPedestrians, pedestrianMotion, type PedestrianPlan } from '@/lib/street-simulation';
import 'maplibre-gl/dist/maplibre-gl.css';
export interface BuildingInfo { id:string;name:string;building:string;levels:string;height:number;heightSource:string;sourceUrl:string;timestamp:string;longitude:number;latitude:number; }
interface Props { state:Exploration;selectedBuildingId?:string;selectedPersonIndex:number|null;focusCommand:number;zoomCommand:{value:number;serial:number};paused:boolean;reduced:boolean;buildingCommand:number;personCommand:number;onRegion:(id:string)=>void;onPlace:(id:string)=>void;onPlaceInfo:(id:string)=>void;onPerson:(i:number)=>void;onBuilding:(b:BuildingInfo)=>void;onZoom:(z:number)=>void;onProvider:(p:string)=>void;onNotice:(s:string)=>void; }
interface Walker { marker:Marker;plan:PedestrianPlan;elapsed:number;hovered:boolean;focused:boolean; }
const fallbackStyle:StyleSpecification={version:8,sources:{
 satellite:{type:'raster',tiles:['https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/2004-01-01/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg'],tileSize:256,maxzoom:8,attribution:'NASA Blue Marble · 2004 composite'},
 streets:{type:'raster',tiles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],tileSize:256,maxzoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a> · contemporary reference'}},layers:[
 {id:'background',type:'background',paint:{'background-color':'#111d23'}},
 {id:'satellite',type:'raster',source:'satellite',paint:{'raster-saturation':-.45,'raster-brightness-max':.65,'raster-opacity':['interpolate',['linear'],['zoom'],14.5,1,15,0]}},
 {id:'streets',type:'raster',source:'streets',minzoom:9,paint:{'raster-opacity':['interpolate',['linear'],['zoom'],9,.72,14.5,.72,15,0],'raster-saturation':-.75,'raster-brightness-max':.5}}]};
export default function MapView(props:Props){
 const container=useRef<HTMLDivElement>(null);const map=useRef<LibreMap|null>(null);const latest=useRef(props);latest.current=props;
 const inspectPerson=useRef<()=>void>(()=>{});
 const [ready,setReady]=useState(false);const [failure,setFailure]=useState('');const [warning,setWarning]=useState('');
 useEffect(()=>{let disposed=false;let frame=0;const walkers=new Map<number,Walker>();const markers:Marker[]=[];let fallbackUsed=false;let lastTick=0;
 Promise.all([import('maplibre-gl'),fetch('/api/map-config',{signal:AbortSignal.timeout(8000)}).then(r=>r.json() as Promise<{key:string}>).catch(()=>({key:''})),fetch('/neighborhoods.geojson',{signal:AbortSignal.timeout(8000)}).then(r=>{if(!r.ok)throw Error();return r.json() as Promise<FeatureCollection>;}).catch(()=>null)]).then(([m,config,geo])=>{
  if(disposed||!container.current)return;
  m.setWorkerUrl('/maplibre-worker.js');
  if(!geo)setWarning('Street geometry could not load. Documented scenes remain available.');
  geo?.features.forEach(f=>{if(f.properties){f.properties.color=['#c7b79c','#b9b6a0','#c6c8b1','#baa88a','#b3c4c5'][Number(f.id)%5];if(f.geometry.type==='Polygon'||f.geometry.type==='MultiPolygon'){const ring=f.geometry.type==='Polygon'?f.geometry.coordinates[0]:f.geometry.coordinates[0][0];const vertices=ring.slice(0,-1);f.properties.longitude=vertices.reduce((sum,p)=>sum+p[0],0)/vertices.length;f.properties.latitude=vertices.reduce((sum,p)=>sum+p[1],0)/vertices.length;}}});
  try{const state=latest.current.state;const p=places.find(p=>p.id===state.placeId);const r=regions.find(r=>r.id===state.regionId);
   const instance=new m.Map({container:container.current,style:config.key?`https://api.maptiler.com/maps/satellite/style.json?key=${encodeURIComponent(config.key)}`:fallbackStyle,center:p?.coordinates||r?.coordinates||[128.4,40.35],zoom:p?(state.view==='street'?16.6:14):r?13:6.3,pitch:state.view==='street'?52:0,bearing:state.view==='street'?-28:0,maxZoom:18,minZoom:5,attributionControl:{compact:true},maxBounds:[[119,33],[137,46]],canvasContextAttributes:{antialias:true}});map.current=instance;
   latest.current.onProvider(config.key?'MapTiler satellite · imagery date varies':'NASA 2004 / contemporary OSM');
   instance.on('error',e=>{if(disposed)return;if(e.error?.message?.includes('WebGL'))setFailure('The interactive map is unavailable. Explore the places below.');else if(config.key&&!fallbackUsed&&!instance.isStyleLoaded()){fallbackUsed=true;instance.setStyle(fallbackStyle);latest.current.onProvider('NASA / OSM · MapTiler unavailable');setWarning('MapTiler is unavailable. Using the geographic reference map.');}else setWarning('Some map imagery is unavailable. Place exploration remains available.');});
   instance.on('style.load',()=>{
    if(!instance.getSource('country')){instance.addSource('country',{type:'geojson',data:'/geography.geojson'});instance.addLayer({id:'country-border',type:'line',source:'country',filter:['==',['get','code'],'PRK'],maxzoom:11,paint:{'line-color':'#d9e4c7','line-opacity':.7,'line-width':1.3}});}
    if(geo&&!instance.getSource('neighborhoods')){
     instance.addSource('neighborhoods',{type:'geojson',data:geo,attribution:'© OpenStreetMap contributors · <a href="/neighborhoods.geojson" target="_blank">ODbL derived data</a>'});
     instance.addLayer({id:'simulation-ground',type:'background',minzoom:15,paint:{'background-color':'#6f8069'}});
     instance.addLayer({id:'road-edge',type:'line',source:'neighborhoods',minzoom:15,filter:['==',['get','kind'],'road'],paint:{'line-color':'#d2cbb4','line-width':['interpolate',['linear'],['zoom'],15,5,18,25]}});
     instance.addLayer({id:'road',type:'line',source:'neighborhoods',minzoom:15,filter:['==',['get','kind'],'road'],paint:{'line-color':['match',['get','highway'],'footway','#b6b298','path','#b6b298','#89958f'],'line-width':['interpolate',['linear'],['zoom'],15,3,18,19]}});
     instance.addLayer({id:'rail',type:'line',source:'neighborhoods',minzoom:15,filter:['==',['get','kind'],'rail'],paint:{'line-color':'#3c4746','line-width':3,'line-dasharray':[2,1]}});
     instance.addLayer({id:'buildings',type:'fill-extrusion',source:'neighborhoods',minzoom:15,filter:['==',['get','kind'],'building'],paint:{'fill-extrusion-color':['get','color'],'fill-extrusion-height':['get','height'],'fill-extrusion-base':0,'fill-extrusion-opacity':1,'fill-extrusion-vertical-gradient':true}});
     instance.on('click','buildings',e=>{if(e.features?.[0]?.properties)latest.current.onBuilding(e.features[0].properties as BuildingInfo);});instance.on('mouseenter','buildings',()=>{instance.getCanvas().style.cursor='pointer';});instance.on('mouseleave','buildings',()=>{instance.getCanvas().style.cursor='';});
    }setReady(true);
   });
   for(const r of regions){const el=document.createElement('button');el.className='region-marker';el.setAttribute('aria-label',`Explore ${r.name}`);el.innerHTML=`<span class="marker-ring"><span></span></span><span class="marker-label">${r.name}<small>${r.korean} · 3 places</small></span>`;el.onclick=event=>{event.stopPropagation();latest.current.onRegion(r.id);};markers.push(new m.Marker({element:el,anchor:'left'}).setLngLat(r.coordinates).addTo(instance));const show=()=>{el.style.display=instance.getZoom()<10?'flex':'none';};show();instance.on('zoom',show);}
   for(const [i,p] of places.entries()){const el=document.createElement('button');el.className='place-marker';el.setAttribute('aria-label',`Visit ${p.name}`);el.innerHTML=`<span class="place-pin">0${i%3+1}</span><span>${p.name}</span>`;el.onclick=event=>{event.stopPropagation();latest.current.onPlaceInfo(p.id);};markers.push(new m.Marker({element:el,anchor:'bottom'}).setLngLat(p.coordinates).addTo(instance));const show=()=>{el.style.display=instance.getZoom()>=10&&latest.current.state.regionId===p.regionId?'flex':'none';};show();instance.on('move',show);}
   instance.addControl(new m.ScaleControl({maxWidth:90,unit:'metric'}),'bottom-right');instance.on('zoomend',()=>{const z=instance.getZoom();latest.current.onZoom(z);const pitch=z>=15?52:0;if(Math.abs(instance.getPitch()-pitch)>1)queueMicrotask(()=>{if(!disposed)instance.easeTo({pitch,bearing:z>=15?-28:0,duration:latest.current.reduced?0:500});});});
   instance.on('moveend',()=>{
    if(instance.getLayer('simulation-ground')){const hasBuildings=instance.queryRenderedFeatures({layers:['buildings']}).length>0;instance.setPaintProperty('simulation-ground','background-opacity',hasBuildings?1:0);if(instance.getLayer('streets'))instance.setPaintProperty('streets','raster-opacity',hasBuildings?['interpolate',['linear'],['zoom'],9,.72,14.5,.72,15,0]:.65);}
    const c=instance.getCenter();const plans=instance.getZoom()>=15&&geo?planPedestrians(geo,[c.lng,c.lat]):[];
    if(walkers.has(latest.current.selectedPersonIndex??-1)&&!plans.some(p=>p.index===latest.current.selectedPersonIndex)&&plans.length===24)plans.pop();
    const wanted=new Set(plans.map(p=>p.index));
    walkers.forEach((walker,index)=>{if(!wanted.has(index)&&(index!==latest.current.selectedPersonIndex||instance.getZoom()<15)){walker.marker.remove();walkers.delete(index);}});
    for(const plan of plans){if(walkers.has(plan.index))continue;
     const el=document.createElement('button');el.className='pedestrian';el.setAttribute('aria-label',`Inspect pedestrian ${plan.index+1}`);el.setAttribute('aria-pressed','false');el.dataset.pedestrianId=String(plan.index);el.innerHTML='<img src="/scenes/pedestrian.png" alt="" draggable="false"/>';el.style.setProperty('--person-hue',String((plan.index%5)*38)+'deg');
     const marker=new m.Marker({element:el,anchor:'bottom',pitchAlignment:'viewport'}).setLngLat(pedestrianMotion(plan,0).position).addTo(instance);
     const walker:Walker={marker,plan,elapsed:0,hovered:false,focused:false};walkers.set(plan.index,walker);
     el.onclick=event=>{event.stopPropagation();latest.current.onPerson(plan.index);};
     el.onmouseenter=()=>{walker.hovered=true;};el.onmouseleave=()=>{walker.hovered=false;};el.onfocus=()=>{walker.focused=true;};el.onblur=()=>{walker.focused=false;};
    }
   });
   inspectPerson.current=()=>{if(!geo){latest.current.onNotice('Street geometry is unavailable. Explore the documented scenes below.');return;}const bounds=instance.getContainer().getBoundingClientRect();const visible=Array.from(walkers.values()).filter(({marker})=>{const el=marker.getElement(),rect=el.getBoundingClientRect();const x=rect.left+rect.width/2,y=rect.bottom-12;return el.style.visibility!=='hidden'&&x>=bounds.left&&x<=bounds.right&&y>=bounds.top&&y<=bounds.bottom&&el.contains(document.elementFromPoint(x,y));});visible.sort((a,b)=>{const distance=(walker:Walker)=>{const p=instance.project(walker.marker.getLngLat());return Math.hypot(p.x-bounds.width/2,p.y-bounds.height/2);};return distance(a)-distance(b);});if(visible[0])latest.current.onPerson(visible[0].plan.index);else latest.current.onNotice('No pedestrians are visible here. Pan toward a mapped road.');};
   const animate=(now:number)=>{if(disposed)return;if(now-lastTick>90){const dt=Math.min(now-lastTick,150)/1000;lastTick=now;
    if(!document.hidden&&!latest.current.state.sceneId)for(const walker of walkers.values()){
     const {marker,plan}=walker;const selected=plan.index===latest.current.selectedPersonIndex;
     const moving=!latest.current.paused&&!latest.current.reduced&&!selected&&!walker.hovered&&!walker.focused;
     if(moving)walker.elapsed+=dt;const motion=pedestrianMotion(plan,walker.elapsed);marker.setLngLat(motion.position);
     const projected=instance.project(marker.getLngLat());const hidden=!!(instance.getLayer('buildings')&&instance.queryRenderedFeatures(projected,{layers:['buildings']}).length>0);
     const el=marker.getElement();el.style.visibility=hidden?'hidden':'visible';el.tabIndex=hidden?-1:0;el.setAttribute('aria-hidden',String(hidden));el.setAttribute('aria-pressed',String(selected));el.classList.toggle('selected',selected);el.classList.toggle('walking',moving&&motion.walking);el.classList.toggle('reverse',motion.reverse);
    }
   }frame=requestAnimationFrame(animate);};frame=requestAnimationFrame(animate);
   instance.once('load',()=>{if(!latest.current.state.regionId){const mobile=instance.getContainer().clientWidth<900;instance.fitBounds([[124,37.7],[130.9,43.1]],{padding:{left:mobile?85:440,right:mobile?110:200,top:90,bottom:mobile?215:150},duration:0});}instance.fire('moveend');latest.current.onZoom(instance.getZoom());});
  }catch{setFailure('The interactive map is unavailable in this browser. Explore the places below.');}
 }).catch(()=>setFailure('The map could not load. Explore the places below.'));
 return()=>{disposed=true;cancelAnimationFrame(frame);inspectPerson.current=()=>{};markers.forEach(m=>m.remove());walkers.forEach(w=>w.marker.remove());map.current?.remove();map.current=null;};},[]);
 useEffect(()=>{if(!ready||!map.current)return;const p=places.find(p=>p.id===props.state.placeId);const r=regions.find(r=>r.id===props.state.regionId);if(!p&&!r){const mobile=map.current.getContainer().clientWidth<900;map.current.fitBounds([[124,37.7],[130.9,43.1]],{padding:{left:mobile?85:440,right:mobile?110:200,top:90,bottom:mobile?215:150},duration:props.reduced?0:800});return;}map.current.flyTo({padding:{top:0,bottom:0,left:0,right:0},center:p?.coordinates||r?.coordinates||[128.4,40.35],zoom:p?(props.state.view==='street'?16.6:14):r?13:6.3,pitch:p&&props.state.view==='street'?52:0,bearing:p&&props.state.view==='street'?-28:0,duration:props.reduced?0:1000});},[ready,props.state.regionId,props.state.placeId,props.focusCommand,props.reduced]);

 useEffect(()=>{if(!props.buildingCommand)return;if(!ready||!map.current?.getLayer('buildings')){latest.current.onNotice('Building geometry is unavailable. Explore the documented scenes below.');return;}const center=map.current.getCenter();const features=map.current.queryRenderedFeatures({layers:['buildings']});features.sort((a,b)=>{const distance=(f:typeof a)=>Math.hypot((Number(f.properties?.longitude)-center.lng)*.77,Number(f.properties?.latitude)-center.lat);return distance(a)-distance(b);});if(features[0]?.properties)latest.current.onBuilding(features[0].properties as BuildingInfo);else latest.current.onNotice('No building footprints are mapped in this view. Explore a scene, or pan toward the coal ground.');},[props.buildingCommand,ready]);
 useEffect(()=>{if(!props.personCommand)return;if(!ready){latest.current.onNotice('The street map is not ready. Explore a documented scene while it loads.');return;}inspectPerson.current();},[props.personCommand,ready]);
 useEffect(()=>{if(!ready||!container.current)return;const resize=new ResizeObserver(()=>map.current?.resize());resize.observe(container.current);return()=>resize.disconnect();},[ready]);
 useEffect(()=>{if(ready&&map.current?.getLayer('buildings'))map.current.setPaintProperty('buildings','fill-extrusion-color',['case',['==',['get','id'],props.selectedBuildingId||''],'#d6e5b6',['get','color']]);},[ready,props.selectedBuildingId]);
 useEffect(()=>{if(ready&&props.zoomCommand.serial)map.current?.zoomTo(Math.max(5,Math.min(18,map.current.getZoom()+props.zoomCommand.value)),{duration:props.reduced?0:400});},[props.zoomCommand,ready,props.reduced]);
 return <><div ref={container} className="map-canvas" aria-label="Interactive map of North Korea"/>{failure&&<div className="map-unavailable" role="status">{failure}</div>}{warning&&!failure&&<div className="tile-warning" role="status">{warning}</div>}</>;
}
