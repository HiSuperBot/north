import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { loadLibrary } from './load-library.mjs';
const {places,entrySceneFor,sources}=await loadLibrary('lib/content.ts');
const {parseExploration,normalizeExploration,explorationUrl}=await loadLibrary('lib/exploration.ts');
const {streetScenarios,scenarioFor}=await loadLibrary('lib/street-content.ts');
const {planStreetEntities,streetEntityMotion}=await loadLibrary('lib/street-entities.ts');
const {entityResident,thoughtPrompt}=await loadLibrary('lib/resident.ts');
const base=JSON.parse(await fs.readFile('public/neighborhoods.geojson','utf8'));
const extra=JSON.parse(await fs.readFile('public/military-neighborhoods.geojson','utf8'));
const geometry={...base,features:[...base.features,...extra.features]};
let samples=0;
function onLine(point,line){return line.slice(1).some((b,i)=>{const a=line[i],dx=b[0]-a[0],dy=b[1]-a[1],t=((point[0]-a[0])*dx+(point[1]-a[1])*dy)/(dx*dx+dy*dy||1);return t>=-1e-8&&t<=1+1e-8&&Math.hypot(point[0]-(a[0]+t*dx),point[1]-(a[1]+t*dy))<1e-9;});}
for(const place of places)for(let year=2015;year<=2019;year++){
 const state=normalizeExploration({year,regionId:place.regionId,placeId:place.id,sceneId:null,view:'street'});
 assert.deepEqual(parseExploration(explorationUrl(state).slice(1)).state,state);
 const entities=planStreetEntities(state,geometry,place.coordinates);
 assert.equal(new Set(entities.map(e=>e.id)).size,entities.length);
 for(const entity of entities){
  for(const asset of [entity.sprite,entity.photograph].filter(Boolean))await fs.access('public'+asset);
  assert.ok(entity.claims.some(c=>c.level==='AI Reconstruction'));
  entity.claims.flatMap(c=>c.sourceIds).forEach(id=>assert.ok(sources.some(s=>s.id===id)));
  if(entity.route){
   const candidates=geometry.features.filter(f=>f.properties.kind===(entity.type==='train'?'rail':'road'));
   assert.ok(candidates.some(f=>JSON.stringify(f.geometry.coordinates)===JSON.stringify(entity.route)),'Vehicle must use a mapped road or rail');
   for(let t=0;t<500;t+=7){assert.ok(onLine(streetEntityMotion(entity,t).position,entity.route));samples++;}
  }
  if(entity.role){const person=entityResident(state,entity),prompt=thoughtPrompt(person);assert.ok(prompt.includes(entity.activity));assert.ok(prompt.includes(scenarioFor(place.id,year,state.scenarioId).period));person.sources.forEach(s=>assert.ok(prompt.includes(s.captured)));}
 }
 if(place.id==='kim-il-sung-square'){
  assert.equal(entities.some(e=>e.type==='tank'),year===2015);
  assert.equal(entities.some(e=>e.type==='soldier'),year===2015);
  assert.equal(entrySceneFor(place,year),year===2015?'parade-reference':'square-exterior');
 }
 if(place.regionId==='dmz'){
  const guards=entities.filter(e=>e.type==='soldier');assert.equal(guards.length,2);
  guards.forEach(g=>assert.equal(g.sprite.includes('unarmed'),year>=2018));
 }
 assert.deepEqual(planStreetEntities({...state,view:'map'},geometry,place.coordinates),[]);
}
const before=parseExploration('?place=panmunjom-jsa&year=2018&scenario=jsa-before').state;
assert.ok(planStreetEntities(before,geometry,places.find(p=>p.id==='panmunjom-jsa').coordinates).filter(e=>e.type==='soldier').every(e=>e.sprite.includes('soldier-armed')));
for(const scenario of streetScenarios)scenario.sourceIds.forEach(id=>assert.ok(sources.some(s=>s.id===id)));
const invalid=parseExploration('?place=panmunjom-jsa&year=2018&scenario=parade-2015');assert.equal(invalid.invalid,true);assert.equal(invalid.state.scenarioId,'jsa-after');
assert.equal(parseExploration('?region=aoji&view=street').state.placeId,'aoji-coal');
assert.equal(parseExploration('?place=kim-il-sung-square&year=2019&scenario=parade-2015').state.scenarioId,'square-reference');
assert.ok(extra.features.some(f=>f.properties.kind==='boundary'));
const production=JSON.parse(await fs.readFile('content/street-sprite-production.json','utf8'));
assert.ok(JSON.stringify(production).includes('prompt'));
console.log(`PASS: eight-place/five-year scenarios, JSA default and before/after guards, 2015-only parade, invalid/legacy URLs, entity asset/claim integrity, original Nano context, and ${samples} mapped road/rail samples.`);
