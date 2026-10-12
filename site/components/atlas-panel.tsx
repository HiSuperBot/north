"use client";
import { MapPin, ArrowUpRight, ExternalLink, X } from 'lucide-react';
import { assetUrl } from '@/lib/hosting';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { atlasLayers, atlasSourcesFor, atlasSourceById, recordAtYear, eventInSelectedYear, type AtlasFeature } from '@/lib/atlas';

export default function AtlasPanel({feature,year,onClose,onPlace}:{feature:AtlasFeature;year:number;onClose:()=>void;onPlace:(id:string)=>void}) {
 const layer=atlasLayers.find(layer=>layer.id===feature.layer)!;const dated=recordAtYear(feature,year);
 return <Sheet open onOpenChange={open=>{if(!open)onClose();}} modal={false}><SheetContent className="building-sheet atlas-sheet" showCloseButton={false} onInteractOutside={event=>event.preventDefault()}>
  <SheetClose className="building-panel-close" aria-label="Close map information"><X size={19}/></SheetClose>
  <div className="building-scroll"><div className="atlas-panel-hero" style={{'--atlas-color':layer.color} as React.CSSProperties}><MapPin size={32}/><span>{layer.name}</span><small>PUBLIC MAP REFERENCE</small></div>
  <div className="building-panel-body"><div className="eyebrow">AREA REFERENCE · {feature.korean}</div><SheetTitle className="building-title">{feature.name}</SheetTitle><SheetDescription className="building-subtitle">{feature.summary}</SheetDescription>
   {feature.entryPlaceId&&<div className="building-actions"><Button variant="outline" onClick={()=>onPlace(feature.entryPlaceId!)}><ArrowUpRight size={16}/>Explore its street</Button></div>}
   <section className="building-section"><h3>Selected year · {year}</h3><p>{dated?dated.title:'No dated activity record in this pilot for this year.'}</p><p className="building-limit">{dated?`Latest retained record at or before ${year}: ${dated.date}. This does not establish activity throughout the selected year.`:'Later records remain listed below with their own dates.'}</p></section>
   <section className="building-section"><h3>Recorded history</h3><ol className="atlas-history">{feature.events.map(event=><li key={event.date+event.title} className={eventInSelectedYear(event,year)?'in-year':''}><time>{event.date}</time><span className="atlas-date-context">{Number(event.date.slice(0,4))>year?'Later than selected year':eventInSelectedYear(event,year)?'In selected year':'Earlier record'}</span><h4>{event.title}</h4><span className={`evidence-tag level-${event.level.toLowerCase()}`}>{event.level==='Observed'?'Documented record':'Published assessment'}</span><p>{event.text}</p>{event.sourceIds.map(id=>{const source=atlasSourceById(id);return <a key={id} className="building-source-link" href={source.url} target="_blank" rel="noopener noreferrer"><span>{source.creator}<small>{source.published}</small></span><ExternalLink size={14}/></a>;})}</li>)}</ol></section>
   <section className="building-section"><h3>What this marker means</h3><p>{feature.spatialNote}</p><p className="building-limit">{feature.limitations}</p><p className="atlas-location">Approximate reference: {feature.coordinates[1].toFixed(2)}°N, {feature.coordinates[0].toFixed(2)}°E</p></section>
   <section className="building-section"><h3>Source records</h3><a className="building-source-link" href={assetUrl('/credits/map-references.json')} target="_blank" rel="noopener noreferrer">Open the reviewed map dataset<ExternalLink size={14}/></a>{atlasSourcesFor(feature).map(source=><article className="atlas-source" key={source.id}><a className="building-source-link" href={source.url} target="_blank" rel="noopener noreferrer"><span>{source.title}<small>{source.creator}</small></span><ExternalLink size={14}/></a><dl><dt>Observed / covered</dt><dd>{source.captured}</dd><dt>Published</dt><dd>{source.published}</dd><dt>Original location</dt><dd>{source.region}</dd><dt>Reuse</dt><dd>{source.rights} · {source.reuse}</dd></dl><p className="building-limit">{source.limitation}</p></article>)}</section>
  </div></div>
 </SheetContent></Sheet>;
}
