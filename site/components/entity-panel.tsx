"use client";
import { assetUrl } from '@/lib/hosting';
import { useState } from 'react';
import { BookOpen, ExternalLink, ImageOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { sourceById } from '@/lib/content';
import type { StreetEntity } from '@/lib/street-content';

export default function EntityPanel({entity,year,onClose,onEvidence}:{entity:StreetEntity;year:number;onClose:()=>void;onEvidence:()=>void}) {
 const [failed,setFailed]=useState(false);
 const source=entity.photographSourceId?sourceById(entity.photographSourceId):undefined;
 return <Sheet open onOpenChange={open=>{if(!open)onClose();}} modal={false}><SheetContent className="building-sheet" showCloseButton={false} onInteractOutside={event=>event.preventDefault()}>
  <SheetClose className="building-panel-close" aria-label="Close object information"><X size={19}/></SheetClose>
  <div className="building-scroll"><div className="building-photo">
   {entity.photograph&&!failed?<img src={assetUrl(entity.photograph)} alt={`${entity.title} · contextual reference`} onError={()=>setFailed(true)}/>:<div className="building-photo-empty"><ImageOff size={28}/><span>{failed?'Reference image unavailable':'No verified photograph'}</span><small>The description and evidence remain available.</small></div>}
   {entity.photograph&&!failed&&<span className={`evidence-tag building-photo-tag level-${source?'observed':'ai-reconstruction'}`}>{source?'Observed reference · not this object':'AI Reconstruction'}</span>}
  </div><div className="building-panel-body">
   <div className="eyebrow">STREET OBJECT · {year} SCENARIO</div><SheetTitle className="building-title">{entity.title}</SheetTitle><SheetDescription className="building-subtitle">{entity.period}</SheetDescription>
   <div className="building-actions"><Button variant="outline" onClick={onEvidence}><BookOpen size={16}/>View evidence</Button></div>
   <section className="building-section"><span className="evidence-tag level-ai-reconstruction">AI Reconstruction</span><p>{entity.description}</p><p className="building-limit">Miniature appearance, placement and movement are illustrative. A reference image does not document this simulated object.</p></section>
   {source&&<section className="building-section"><h3>About the photograph</h3><p>{source.captured} · {source.region}</p><p>{source.limitation}</p><a className="building-source-link" href={source.url} target="_blank" rel="noopener noreferrer"><span>{source.creator}<small>{source.rights} · reference resized / WebP</small></span><ExternalLink size={16}/></a></section>}
   {entity.claims.map((claim,i)=><section className="building-section" key={i}><span className={`evidence-tag level-${claim.level.toLowerCase().replaceAll(' ','-')}`}>{claim.level}</span><h3>{claim.element}</h3><p>{claim.description}</p>{claim.sourceIds.map(id=>{const s=sourceById(id);return <a className="building-source-link" key={id} href={s.url} target="_blank" rel="noopener noreferrer"><span>{s.title}<small>{s.captured}</small></span><ExternalLink size={14}/></a>;})}</section>)}
  </div></div>
 </SheetContent></Sheet>;
}
