"use client";
import { useEffect, useState } from 'react';
import { BookOpen, Building2, ExternalLink, ImageOff, MapPin, Scan, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { scenes, sceneById, sourceById, type Place } from '@/lib/content';
import type { BuildingInfo } from '@/components/map-view';

export default function BuildingPanel({building,place,year,onClose,onScene,onEvidence}:{building?:BuildingInfo|null;place?:Place;year:number;onClose:()=>void;onScene:(id:string)=>void;onEvidence:(sceneId?:string)=>void}){
 const entry=sceneById(place?.entryScene);
 const life=scenes.find(s=>s.placeId===place?.id&&s.type==='AI Reconstruction');
 const gallery=entry?[entry,...(life&&life.id!==entry.id?[life]:[])]:[];
 const [active,setActive]=useState(entry?.id||'');
 const [failed,setFailed]=useState(false);
 useEffect(()=>{setActive(entry?.id||'');setFailed(false);},[building?.id,place?.id,entry?.id]);
 const photograph=gallery.find(s=>s.id===active)||entry;
 const title=place?.name||building?.name||'Mapped building';
 const photoSource=photograph?.claims.flatMap(c=>c.sourceIds).map(sourceById).find(s=>s.reuse==='asset');
 const matched=!!building&&!!place;
 return <Sheet open={!!building||!!place} onOpenChange={open=>{if(!open)onClose();}} modal={false}><SheetContent className="building-sheet" showCloseButton={false} onInteractOutside={event=>event.preventDefault()}>
 <SheetClose className="building-panel-close" aria-label="Close building information"><X size={19}/></SheetClose>
 <div className="building-scroll">
 <div className="building-photo">
 {photograph&&!failed?<img key={photograph.id} src={photograph.image} alt={photograph.title} onError={()=>setFailed(true)}/>:<div className="building-photo-empty"><ImageOff size={30}/><span>{failed?'Photograph unavailable':'No verified photograph'}</span><small>{failed?'The building information is still available.':'This building’s appearance has not been documented in this pilot.'}</small></div>}
 {photograph&&!failed&&<span className={`evidence-tag building-photo-tag level-${photograph.type==='Photograph'?'observed':'ai-reconstruction'}`}>{photograph.type==='Photograph'?'Observed photograph':'AI Reconstruction'}</span>}
 </div>
 {gallery.length>1&&<div className="building-gallery" aria-label="Building images">{gallery.map(s=><button key={s.id} aria-label={s.type==='Photograph'?'Show observed exterior':'Show AI reconstruction'} aria-pressed={photograph?.id===s.id} onClick={()=>{setActive(s.id);setFailed(false);}}><img src={s.image} alt=""/><span>{s.type==='Photograph'?'Exterior':'Imagined life'}</span></button>)}</div>}
 <div className="building-panel-body">
 <div className="eyebrow">{building?'BUILDING RECORD':'DOCUMENTED PLACE'}</div>
 <SheetTitle className="building-title">{title}</SheetTitle>
 <SheetDescription className="building-subtitle">{place?.subtitle||(building?.building&&building.building!=='yes'?building.building.replaceAll('_',' '):'Use not recorded in the map')} · {year} scenario</SheetDescription>
 {photograph&&<div className="building-photo-caption"><span>{photograph.period}</span><span>{photograph.location}</span>{photoSource?<a href={photoSource.url} target="_blank" rel="noopener noreferrer">{photoSource.creator} · {photoSource.rights}<ExternalLink size={12}/></a>:<span>{photograph.credit}</span>}</div>}
 {(place||photograph)&&<div className="building-actions"><Button onClick={()=>onScene(photograph?.id||place!.entryScene)}><Scan size={16}/>{photograph?.type==='Photograph'?'Open photograph':'Explore reconstruction'}</Button><Button variant="outline" onClick={()=>onEvidence(photograph?.id)}><BookOpen size={16}/>Evidence</Button></div>}
 <section className="building-section"><h3><Building2 size={16}/> About this place</h3><p>{place?.description||'A building footprint recorded in OpenStreetMap. No verified history, interior, occupancy or photograph has been linked to this feature.'}</p>{matched&&<p className="building-limit">The photograph-to-footprint match is an editorial spatial identification.</p>}</section>
 <section className="building-section"><h3><MapPin size={16}/> Location & map record</h3><dl>
 {building&&<><dt>Mapped name</dt><dd>{building.name}</dd><dt>Building type</dt><dd>{building.building&&building.building!=='yes'?building.building.replaceAll('_',' '):'Not specified'}</dd>{building.levels&&<><dt>Mapped levels</dt><dd>{building.levels} · current map</dd></>}<dt>Rendered height</dt><dd>{building.height} m <small>{building.heightSource}</small></dd><dt>Map edit date</dt><dd>{building.timestamp?.slice(0,10)||'Unknown'}</dd></>}
 <dt>Coordinates</dt><dd>{(building?.latitude??place?.coordinates[1])?.toFixed(5)}, {(building?.longitude??place?.coordinates[0])?.toFixed(5)}</dd>
 <dt>Selected year</dt><dd>{year} <small>Scenario year; source dates stay unchanged.</small></dd>
 </dl><span className="evidence-tag level-inferred">Inferred appearance</span><p className="building-limit">Contemporary mapping does not establish this building’s appearance in {year}. Rendered color and missing height are illustrative.</p></section>
 <section className="building-section"><h3>Sources & further reading</h3>{building&&<a className="building-source-link" href={building.sourceUrl} target="_blank" rel="noopener noreferrer"><span>OpenStreetMap feature<small>Way {building.id} · ODbL</small></span><ExternalLink size={15}/></a>}{place?.spatialSources.map(id=>{const s=sourceById(id);return <a className="building-source-link" key={id} href={s.url} target="_blank" rel="noopener noreferrer"><span>{s.title}<small>{s.captured}</small></span><ExternalLink size={15}/></a>;})}{!place&&<Button variant="outline" onClick={()=>onEvidence()}><BookOpen size={16}/>View evidence</Button>}</section>
 </div></div>
 </SheetContent></Sheet>;
}
