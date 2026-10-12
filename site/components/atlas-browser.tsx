"use client";
import { Layers, ArrowUpRight, X } from 'lucide-react';
import { atlasFeatures, atlasLayers, type AtlasLayerId } from '@/lib/atlas';

export default function AtlasBrowser({layers,selectedId,onToggle,onSelect,onClose}:{layers:AtlasLayerId[];selectedId?:string|null;onToggle:(id:AtlasLayerId)=>void;onSelect:(id:string)=>void;onClose:()=>void}) {
 const visible=atlasFeatures.filter(feature=>layers.includes(feature.layer));
 return <section className="atlas-browser" aria-label="Documentary map layers">
  <div className="atlas-heading"><span><Layers size={16}/>Map layers<small>{visible.length} public references</small></span><button onClick={onClose} aria-label="Return to life exploration"><X size={17}/></button></div>
  <div className="atlas-layer-filters" aria-label="Map layer filters">{atlasLayers.map(layer=><button key={layer.id} aria-pressed={layers.includes(layer.id)} onClick={()=>onToggle(layer.id)}><i style={{background:layer.color}}/>{layer.name}<small>{atlasFeatures.filter(feature=>feature.layer===layer.id).length}</small></button>)}</div>
  <div className="atlas-reference-list" aria-label="Public map references">{visible.map(feature=><button key={feature.id} onClick={()=>onSelect(feature.id)} aria-pressed={selectedId===feature.id}><span className="atlas-list-code" style={{color:atlasLayers.find(layer=>layer.id===feature.layer)!.color}}>{atlasLayers.find(layer=>layer.id===feature.layer)!.short}</span><span>{feature.name}<small>{feature.korean} · area reference</small></span><ArrowUpRight size={14}/></button>)}</div>
  {!visible.length&&<p className="atlas-empty">Choose a layer to show its map references.</p>}
  <p className="atlas-caption">Original dates stay visible. Nuclear facilities do not identify weapon stockpiles.</p>
 </section>;
}
