import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { Box3, Vector3, Mesh } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { loadLibrary } from './load-library.mjs';

const {dioramaAssetIds,dioramaAsset,isDioramaPlace,dioramaHeading,cylinderFeatureId}=await loadLibrary('lib/diorama-catalog.ts');
const {places,sources}=await loadLibrary('lib/content.ts');
const {planStreetEntities}=await loadLibrary('lib/street-entities.ts');
const production=JSON.parse(await fs.readFile('content/diorama-production.json','utf8'));
assert.deepEqual(JSON.parse(await fs.readFile('public/credits/pyongyang-diorama.json','utf8')),production,'Published credits must match the source record');
for(const key of ['script','blendSource','thumbnailScript','validationScript'])await fs.access(production.generator[key]);
const geometry=JSON.parse(await fs.readFile('public/neighborhoods.geojson','utf8'));
const feature=geometry.features.find(feature=>String(feature.properties.id)===cylinderFeatureId);
assert.equal(feature.geometry.coordinates[0].length,85,'Review tower arc registration if the source footprint changes');
assert.ok(sources.some(source=>source.id==='apartment-photo'&&source.reuse==='asset'));
assert.ok(isDioramaPlace('kwangbok-apartment'));assert.ok(!isDioramaPlace('kim-il-sung-square'));assert.ok(!isDioramaPlace('aoji-coal'));
assert.equal(dioramaHeading([0,0],[0,-1],0),0);assert.equal(dioramaHeading([0,0],[1,0],0),Math.PI/2);
assert.equal(dioramaHeading([0,0],[0,1],0),Math.PI);assert.equal(dioramaHeading([0,0],[0,0],0),null);
let bytes=0,gzipBytes=0,triangles=0;
const report=[];
for(const id of dioramaAssetIds){
 const asset=dioramaAsset(id),file=await fs.readFile(`public${asset.model}`);bytes+=file.length;gzipBytes+=gzipSync(file).length;
 assert.equal(file.readUInt32LE(0),0x46546c67,`${id}: binary glTF header`);assert.equal(file.readUInt32LE(4),2);
 assert.equal(file.readUInt32LE(8),file.length);assert.ok(file.length<1_200_000,`${id}: model budget`);
 const record=production.assets.find(record=>record.id===id);assert.ok(record&&record.reviewed&&record.evidenceLevel==='AI Reconstruction');assert.equal(record.sha256,createHash('sha256').update(file).digest('hex'),`${id}: reviewed asset hash`);
 const jsonLength=file.readUInt32LE(12),json=JSON.parse(file.subarray(20,20+jsonLength).toString('utf8'));
 assert.ok(!(json.images?.length),'Models must not load bitmap textures');assert.ok(json.buffers.every(buffer=>!buffer.uri),'Models must be self-contained');
 assert.equal(asset.provenance,'AI Reconstruction');
 const thumbnail=await fs.readFile(`public${asset.thumbnail}`);assert.ok(thumbnail.length<90_000,`${id}: thumbnail budget`);
 assert.equal(thumbnail.toString('ascii',0,4),'RIFF');assert.equal(thumbnail.toString('ascii',8,12),'WEBP');
 const array=file.buffer.slice(file.byteOffset,file.byteOffset+file.byteLength),gltf=await new GLTFLoader().parseAsync(array,'');
 const box=new Box3().setFromObject(gltf.scene),size=box.getSize(new Vector3());
 assert.ok(Math.abs(box.min.y)<.025,`${id}: ground contact (${box.min.y})`);
 if(['resident','commuter','porter'].includes(id)){
  assert.ok(size.y>1.5&&size.y<2.1,`${id}: human meter scale`);
  for(const part of ['arm-left','arm-right','leg-left','leg-right'])assert.ok(json.nodes.some(node=>node.extras?.motionPart===part),`${id}: stable animation pivot ${part}`);
 }
 if(id==='bus')assert.ok(size.z>8&&size.z<12&&size.x<3.6&&size.z>size.x*2,'Bus forward is +Z, not width');
 if(id==='apartment-cylinder'){assert.ok(size.y>=35&&size.y<=37);assert.ok(size.x>=27&&size.x<=30);}
 const draws=json.meshes.reduce((sum,mesh)=>sum+mesh.primitives.length,0);assert.ok(draws<=20,`${id}: primitive budget`);
 gltf.scene.traverse(object=>{if(object instanceof Mesh){triangles+=(object.geometry.index?.count||object.geometry.getAttribute('position').count)/3;object.geometry.dispose();const materials=Array.isArray(object.material)?object.material:[object.material];materials.forEach(material=>material.dispose());}});
 report.push({id,bytes:file.length,thumbnail:thumbnail.length,draws});
}
assert.ok(bytes<3_000_000,'Entire model library must stay below 3 MB');
for(const place of places)for(let year=2015;year<=2019;year++){
 const state={year,regionId:place.regionId,placeId:place.id,sceneId:null,scenarioId:null,view:'street'};
 const entities=planStreetEntities(state,geometry,place.coordinates);
 for(const entity of entities)if(entity.visualAssetId){assert.ok(isDioramaPlace(place.id));assert.ok(dioramaAssetIds.includes(entity.visualAssetId));assert.ok(entity.claims.some(claim=>claim.level==='AI Reconstruction'));}
}
console.log(`PASS: ${report.length} self-contained GLBs, meter/ground/orientation contracts, stable limb pivots, rights-linked place scope, original footprint registration, WebP thumbnails and release budgets. Models ${bytes} B raw / ${gzipBytes} B gzip; ${Math.round(triangles)} library triangles.`);
