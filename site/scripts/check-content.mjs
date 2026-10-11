import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { loadLibrary } from './load-library.mjs';
const {regions,places,scenes,sources}=await loadLibrary('lib/content.ts');
const {parseExploration,explorationUrl,positionAlongRoad,normalizeExploration}=await loadLibrary('lib/exploration.ts');
assert.equal(places.length,8);assert.equal(scenes.filter(s=>s.type==='AI Reconstruction').length,6);
for(const collection of [regions,places,scenes,sources])assert.equal(new Set(collection.map(x=>x.id)).size,collection.length);
for(const place of places){assert.ok(regions.some(r=>r.id===place.regionId));assert.ok(scenes.some(s=>s.id===place.entryScene));assert.ok(place.spatialSources.length);place.spatialSources.forEach(id=>assert.ok(sources.some(s=>s.id===id)));}
for(const scene of scenes){
 assert.ok(places.some(p=>p.id===scene.placeId));assert.ok(scene.claims.length);await fs.access('public'+scene.image);
 if(scene.hotspot){assert.ok(scene.hotspot.x>=0&&scene.hotspot.x<=100&&scene.hotspot.y>=0&&scene.hotspot.y<=100);assert.ok(scenes.some(s=>s.id===scene.hotspot.sceneId&&s.placeId===scene.placeId));}
 for(const claim of scene.claims){claim.sourceIds.forEach(id=>assert.ok(sources.some(s=>s.id===id)));if(claim.level==='Observed')assert.ok(claim.sourceIds.length);if(claim.level==='Corroborated')assert.ok(new Set(claim.sourceIds.map(id=>sources.find(s=>s.id===id).original)).size>=2);}
 const ancestors=new Set([scene.id]);let parent=scene.parent;while(parent){assert.ok(!ancestors.has(parent),'Cycle in scene navigation');ancestors.add(parent);parent=scenes.find(s=>s.id===parent)?.parent;}
 for(let year=2015;year<=2019;year++){const place=places.find(p=>p.id===scene.placeId);const state={year,regionId:place.regionId,placeId:place.id,sceneId:scene.id,view:'street'};assert.deepEqual(parseExploration(explorationUrl(state).slice(1)).state,normalizeExploration(state));}
}
for(const s of sources)for(const key of ['url','creator','captured','published','region','rights','original'])assert.ok(s[key],`${s.id} lacks ${key}`);
assert.equal(parseExploration('?scene=unavailable&region=aoji&year=2030').invalid,true);
assert.equal(parseExploration('?scene=unavailable&region=aoji&year=2030').state.year,2018);
assert.equal(parseExploration('?place=kwangbok-apartment&view=map').state.view,'map');
assert.deepEqual(positionAlongRoad([[0,0],[1,0],[1,1]],0),[0,0]);assert.deepEqual(positionAlongRoad([[0,0],[1,0],[1,1]],1),[1,1]);
for(let i=0;i<=100;i++){const [x,y]=positionAlongRoad([[125,39],[125.002,39],[125.002,39.003]],i/100);assert.ok(Math.abs(y-39)<1e-9||Math.abs(x-125.002)<1e-9,'Pedestrian left mapped road');}
const geo=JSON.parse(await fs.readFile('public/neighborhoods.geojson','utf8'));assert.ok(geo.features.filter(f=>f.properties.kind==='building').length>100);assert.ok(geo.features.filter(f=>f.properties.kind==='road').length>100);
const credits=JSON.parse(await fs.readFile('content/asset-rights.json','utf8'));assert.equal(credits.photographs.length,11);credits.photographs.forEach(p=>assert.ok(p.licenseUrl&&p.originalFile&&p.creator));
console.log('PASS: eight places, 17 scenes, source integrity, independent corroboration policy, 85 year/scene URL round-trips, invalid URLs, navigation graph, asset rights, and pedestrian road geometry.');
