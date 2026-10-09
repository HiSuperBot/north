"use client";
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Scene } from '@/lib/content';
interface Props {scene:Scene;command:{value:number;serial:number};onNext:(id:string)=>void;onBack:()=>void;onDetail:(label:string)=>void;}
export default function SceneViewer({scene,command,onNext,onBack,onDetail}:Props){
 const frame=useRef<HTMLDivElement>(null);const pointers=useRef(new Map<number,{x:number;y:number}>());const pinch=useRef(0);const lastWheel=useRef(0);const lastCommand=useRef(command.serial);
 const [size,setSize]=useState({width:1,height:1,naturalWidth:1536,naturalHeight:1024});const [scale,setScale]=useState(1);const [pan,setPan]=useState({x:0,y:0});const [failed,setFailed]=useState(false);const [loaded,setLoaded]=useState(false);const [retry,setRetry]=useState(0);
 const fit=Math.min(size.width/size.naturalWidth,size.height/size.naturalHeight);const w=size.naturalWidth*fit;const h=size.naturalHeight*fit;const max=Math.max(1,Math.min(4,1/fit));
 const clamp=useCallback((p:{x:number;y:number},s:number)=>({x:Math.max(-w*(s-1)/2,Math.min(w*(s-1)/2,p.x)),y:Math.max(-h*(s-1)/2,Math.min(h*(s-1)/2,p.y))}),[w,h]);
 useEffect(()=>{const el=frame.current;if(!el)return;const observer=new ResizeObserver(([entry])=>setSize(s=>({...s,width:entry.contentRect.width,height:entry.contentRect.height})));observer.observe(el);return()=>observer.disconnect();},[]);
 useEffect(()=>()=>pointers.current.clear(),[]);
 useEffect(()=>{if(loaded&&scene.crop){const s=Math.min(max,scene.crop.scale);setScale(s);setPan(clamp({x:(.5-scene.crop.x/100)*w*s,y:(.5-scene.crop.y/100)*h*s},s));}},[loaded,scene.id,max,w,h,clamp,scene.crop]);
 const zoom=useCallback((direction:number)=>{if(!loaded||failed)return;if(direction>0&&scale>=max-.02){if(scene.hotspot)onNext(scene.hotspot.sceneId);return;}if(direction<0&&scale<=1.02){onBack();return;}const s=Math.max(1,Math.min(max,scale+direction*.3));setScale(s);setPan(p=>clamp(p,s));},[scale,max,scene.hotspot,loaded,failed,onNext,onBack,clamp]);
 useEffect(()=>{if(command.serial!==lastCommand.current){lastCommand.current=command.serial;zoom(command.value);}},[command,zoom]);
 useEffect(()=>{onDetail(loaded?`${Math.round(scale*100)}% · ${scale>=max-.02?'image detail limit':'drag to look around'}`:'Loading scene');},[scale,max,loaded,onDetail]);
 return <div ref={frame} className="scene-viewer" tabIndex={0} role="region" aria-label={`${scene.title} image viewer`} onKeyDown={e=>{if(e.key==='+'||e.key==='='){e.preventDefault();zoom(1);}else if(e.key==='-'){e.preventDefault();zoom(-1);}else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();setPan(p=>clamp({x:p.x+(e.key==='ArrowLeft'?40:e.key==='ArrowRight'?-40:0),y:p.y+(e.key==='ArrowUp'?40:e.key==='ArrowDown'?-40:0)},scale));}}}
 onWheel={e=>{e.stopPropagation();if(Date.now()-lastWheel.current<280)return;lastWheel.current=Date.now();zoom(e.deltaY<0?1:-1);}}
 onPointerDown={e=>{if((e.target as HTMLElement).closest('button'))return;pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});e.currentTarget.setPointerCapture(e.pointerId);if(pointers.current.size===2){const [a,b]=Array.from(pointers.current.values());pinch.current=Math.hypot(a.x-b.x,a.y-b.y);}}}
 onPointerMove={e=>{const previous=pointers.current.get(e.pointerId);if(!previous)return;pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.current.size===2){const [a,b]=Array.from(pointers.current.values());const distance=Math.hypot(a.x-b.x,a.y-b.y);if(pinch.current){setScale(s=>Math.max(1,Math.min(max,s*distance/pinch.current)));}pinch.current=distance;}else setPan(p=>clamp({x:p.x+e.clientX-previous.x,y:p.y+e.clientY-previous.y},scale));}}
 onPointerUp={e=>{pointers.current.delete(e.pointerId);pinch.current=0;}} onPointerCancel={e=>{pointers.current.delete(e.pointerId);pinch.current=0;}}>
 <div className="image-plane" style={{width:w,height:h,transform:`translate(-50%,-50%) translate(${pan.x}px,${pan.y}px) scale(${scale})`,opacity:loaded?1:0}}>
 {/* Original proportions are preserved; display zoom stops at available source resolution. */}
 <img src={scene.image+(retry?'?retry='+retry:'')} alt={scene.type==='AI Reconstruction'?`AI reconstruction: ${scene.title}. ${scene.description}`:scene.title} draggable={false} onLoad={e=>{const naturalWidth=e.currentTarget.naturalWidth;const naturalHeight=e.currentTarget.naturalHeight;setSize(s=>({...s,naturalWidth,naturalHeight}));setLoaded(true);setFailed(false);}} onError={()=>{setFailed(true);setLoaded(false);}}/>
 {scene.hotspot&&<button className="scene-hotspot" aria-label={scene.hotspot.label} style={{left:scene.hotspot.x+'%',top:scene.hotspot.y+'%',transform:`translate(-50%,-50%) scale(${1/scale})`}} onClick={()=>onNext(scene.hotspot!.sceneId)}><span>+</span><small>{scene.hotspot.label}</small></button>}
 </div>
 {!loaded&&!failed&&<div className="scene-loading" role="status">Loading the next view…</div>}
 {failed&&<div className="scene-loading" role="alert">This image could not load.<button onClick={()=>{setFailed(false);setRetry(n=>n+1);}}>Retry image</button><button onClick={onBack}>Return to previous view</button></div>}
 </div>;
}
