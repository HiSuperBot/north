"use client";
import { useEffect, useRef, useState } from 'react';
import { BookOpen, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { nanoOptions, generateNanoThought, type NanoAPI, type ResidentScenario } from '@/lib/resident';
export default function PersonPanel({person,onClose,onEvidence}:{person:ResidentScenario;onClose:()=>void;onEvidence:()=>void}){
 const [availability,setAvailability]=useState('checking');const [thought,setThought]=useState(person.thought);const [generated,setGenerated]=useState(false);const [busy,setBusy]=useState(false);const [status,setStatus]=useState('');const request=useRef<AbortController|null>(null);
 useEffect(()=>{let active=true;const api=(window as Window&{LanguageModel?:NanoAPI}).LanguageModel;if(!api)setAvailability('unavailable');else api.availability(nanoOptions).then(value=>{if(active)setAvailability(value);}).catch(()=>{if(active)setAvailability('unavailable');});return()=>{active=false;request.current?.abort();request.current=null;};},[]);
 const generate=async()=>{
  const api=(window as Window&{LanguageModel?:NanoAPI}).LanguageModel;if(!api)return;
  request.current?.abort();const controller=new AbortController();request.current=controller;const timeout=setTimeout(()=>controller.abort(),180000);
  setBusy(true);setStatus(availability==='available'?'Imagining a thought on your device…':'Preparing the on-device model…');
  try{const next=await generateNanoThought(api,person,controller.signal,loaded=>setStatus(`Downloading the on-device model · ${Math.round(loaded*100)}%`));if(controller.signal.aborted)return;setAvailability('available');if(next){setThought(next);setGenerated(true);setStatus('Generated on your device · Gemini Nano');}else setStatus('The response could not be used. Keeping the current thought.');}
  catch{if(request.current===controller)setStatus('On-device generation did not finish. Keeping the current thought.');}
  finally{clearTimeout(timeout);if(request.current===controller){request.current=null;setBusy(false);}}
 };
 const supported=availability!=='checking'&&availability!=='unavailable';
 return <aside className="inspector person-inspector" aria-label="Person information"><button className="inspector-close" onClick={onClose} aria-label="Close information"><X size={18}/></button>
 <span className="eyebrow">IMAGINED RESIDENT · {person.year}</span><div className="person-heading"><img src="/scenes/pedestrian.png" alt=""/><div><h2>{person.role}</h2><p>{person.activity}</p></div></div><div className="person-situation"><span>{person.location}</span><small>Selected person · paused while you look</small></div><div className="thought-bubble" aria-live="polite">“{thought}”</div>
 <div className="thought-origin"><span className="evidence-tag level-ai-reconstruction">AI Reconstruction</span><small>{generated?'Gemini Nano · on device':'Prepared scenario'}</small></div>
 <p className="inspector-note">An imagined thought, not a real person’s testimony. The selected year frames the scenario; no specific historical event or resident is claimed.</p>
 {supported&&<div className="nano-controls"><Button variant="outline" onClick={()=>void generate()} disabled={busy}><Sparkles size={15}/>{busy?'Preparing…':availability==='available'?'Imagine another thought':'Enable on-device thoughts'}</Button>{busy&&<Button variant="ghost" onClick={()=>request.current?.abort()}>Cancel</Button>}<small>{availability==='available'?'Runs locally in this browser.':'Chrome may download a large model on first use.'}</small></div>}
 {availability==='unavailable'&&<p className="nano-unavailable">On-device thoughts are unavailable in this browser. Showing a prepared scenario.</p>}
 {status&&<p className="nano-status" role="status">{status}</p>}
 {person.sources.length>0&&<div className="person-context"><span className="eyebrow">REGIONAL CONTEXT</span>{person.sources.slice(0,2).map(source=><a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.title}<small>{source.captured}</small></a>)}</div>}
 <Button variant="outline" onClick={onEvidence}><BookOpen size={15}/>View evidence</Button>
 </aside>;
}
