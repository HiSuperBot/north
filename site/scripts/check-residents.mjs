import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { loadLibrary } from './load-library.mjs';
const content=await loadLibrary('lib/content.ts');
const resident=await loadLibrary('lib/resident.ts');
for(const place of content.places)for(let year=2015;year<=2019;year++)for(let index=0;index<24;index++){
 const scenario=resident.residentScenario({year,regionId:place.regionId,placeId:place.id,sceneId:null,view:'street'},index);
 assert.equal(scenario.year,year);assert.equal(scenario.location,place.name);assert.ok(scenario.activity&&scenario.thought);
 const prompt=resident.thoughtPrompt(scenario);assert.ok(prompt.includes(`Scenario year: ${year}`));assert.ok(prompt.includes('Do not infer a year-specific event'));
 for(const source of scenario.sources){const original=content.sources.find(s=>s.url===source.url);assert.equal(source.captured,original.captured);assert.ok(prompt.includes(source.captured));}
}
assert.equal(content.placeForBuilding('https://www.openstreetmap.org/way/210296271').id,'kwangbok-apartment');
assert.equal(content.placeForBuilding('https://www.openstreetmap.org/way/42075499'),undefined,'An unrelated building must not inherit an apartment photograph');
const person=resident.residentScenario({year:2018,regionId:'pyongyang',placeId:'kwangbok-apartment',sceneId:null,view:'street'},0);
let destroyed=0,progress=0;let response=JSON.stringify({thought:'I should finish my errand before heading home.'});let abortDuringPrompt;
const api={create:async options=>{assert.deepEqual(options.expectedOutputs,[{type:'text',languages:['en']}]);assert.ok(options.initialPrompts[0].content.includes('Preserve the meaning'));options.monitor({addEventListener:(type,listener)=>{assert.equal(type,'downloadprogress');listener({loaded:.5});}});return {prompt:async (input,options)=>{assert.ok(input.includes('Scenario year: 2018'));assert.equal(options.responseConstraint.additionalProperties,false);abortDuringPrompt?.();return response;},destroy:()=>destroyed++};}};
assert.equal(await resident.generateNanoThought(api,person,new AbortController().signal,p=>progress=p),'I should finish my errand before heading home.');assert.equal(progress,.5);assert.equal(destroyed,1);
response='not valid JSON';assert.equal(await resident.generateNanoThought(api,person,new AbortController().signal,()=>{}),null);assert.equal(destroyed,2);
const controller=new AbortController();abortDuringPrompt=()=>controller.abort();response=JSON.stringify({thought:'A stale thought must never replace the current person.'});await assert.rejects(resident.generateNanoThought(api,person,controller.signal,()=>{}),{name:'AbortError'});assert.equal(destroyed,3);
for(const invalid of [{thought:'x'},{thought:'I will visit this place in 2026.'},{thought:'<script>This is not a thought</script>'},{thought:'I should go home now.',extra:'unreviewed'}])assert.equal(resident.parseThought(JSON.stringify(invalid)),null);
console.log('PASS: 960 place/year/person contexts, original source dates, explicit building-photo identity, Nano API contract, download progress, invalid output, cancellation and session cleanup. Native model generation requires a supported device; the adapter tests use a test double.');
