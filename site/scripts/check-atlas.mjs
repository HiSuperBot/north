import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { loadLibrary } from './load-library.mjs';
const {atlasFeatures,atlasLayers,atlasSourceById,normalizeAtlasLayers,defaultAtlasLayers,recordAtYear}=await loadLibrary('lib/atlas.ts');
const {parseExploration,explorationUrl,normalizeExploration}=await loadLibrary('lib/exploration.ts');
const {placeById}=await loadLibrary('lib/content.ts');
assert.equal(atlasFeatures.length,14);assert.equal(atlasLayers.length,6);
assert.equal(new Set(atlasFeatures.map(feature=>feature.id)).size,atlasFeatures.length);
let roundTrips=0;
for(const feature of atlasFeatures){
 assert.ok(atlasLayers.some(layer=>layer.id===feature.layer));
 assert.ok(feature.coordinates[0]>=124&&feature.coordinates[0]<=131&&feature.coordinates[1]>=37.5&&feature.coordinates[1]<=43.2);
 feature.coordinates.forEach(value=>assert.ok(Math.abs(value*100-Math.round(value*100))<1e-8,'Reference must retain its declared area precision'));
 assert.ok(feature.spatialNote&&feature.summary&&feature.limitations&&feature.spatialSourceIds.length);
 if(feature.entryPlaceId)assert.ok(placeById(feature.entryPlaceId));
 for(const id of [...feature.spatialSourceIds,...feature.events.flatMap(event=>event.sourceIds)]){
  const source=atlasSourceById(id);assert.ok(source,`Missing source ${id}`);
  for(const key of ['url','creator','captured','published','region','rights','original'])assert.ok(source[key]);
  assert.equal(new URL(source.url).protocol,'https:');
 }
 assert.deepEqual(feature.events.map(event=>event.date),feature.events.map(event=>event.date).sort());
 for(const event of feature.events){assert.match(event.date,/^\d{4}(?:-\d{2}-\d{2})?$/);assert.ok(event.sourceIds.length);assert.ok(['Observed','Inferred'].includes(event.level));}
 for(let year=2015;year<=2019;year++)for(const layers of [defaultAtlasLayers,[],['nuclear'],['transport','nature']]){
  const state=normalizeExploration({year,view:'map',regionId:null,placeId:null,sceneId:null,featureId:feature.id,atlasLayers:layers});
  const parsed=parseExploration(new URL(explorationUrl(state),'https://example.test').search);
  assert.equal(parsed.invalid,false);assert.deepEqual(parsed.state,state);assert.ok(state.atlasLayers.includes(feature.layer));
  const event=recordAtYear(feature,year);if(event)assert.ok(Number(event.date.slice(0,4))<=year);
  roundTrips++;
 }
}
assert.deepEqual(normalizeAtlasLayers(['unknown','nature','nature']),['nature']);
assert.deepEqual(parseExploration('?layers=').state.atlasLayers,[]);
assert.equal(parseExploration('?layers=unknown&feature=unknown').invalid,true);
assert.equal(parseExploration('?layers=unknown&feature=unknown').state.featureId,null);
assert.equal(parseExploration('?feature=yongbyon&place=kwangbok-apartment').invalid,true);
assert.equal(parseExploration('?feature=yongbyon&place=kwangbok-apartment').state.placeId,null);
assert.equal(recordAtYear(atlasFeatures.find(feature=>feature.id==='tongil-market'),2016),undefined);
assert.equal(recordAtYear(atlasFeatures.find(feature=>feature.id==='puhung-metro'),2018),undefined);
assert.equal(recordAtYear(atlasFeatures.find(feature=>feature.id==='mount-kumgang'),2017),undefined);
assert.equal(recordAtYear(atlasFeatures.find(feature=>feature.id==='punggye-ri'),2015),undefined);
assert.equal(recordAtYear(atlasFeatures.find(feature=>feature.id==='punggye-ri'),2017).date,'2017-09-03');
const review=JSON.parse(await fs.readFile('content/map-reference-review.json','utf8'));
const published=JSON.parse(await fs.readFile('public/credits/map-references.json','utf8'));assert.deepEqual(review,published);
assert.ok((await fs.stat('public/credits/map-references.json')).size<40000,'Keep documentary metadata compact');
assert.ok(review.scope.includes('No weapon storage'));assert.ok(review.coordinatePolicy);
console.log(`PASS: 14 documentary references, six themes, source/date/area-precision contracts, ${roundTrips} layer/year URL round-trips, empty/invalid recovery and pre-designation temporal limits.`);
