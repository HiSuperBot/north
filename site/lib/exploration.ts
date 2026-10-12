import { basePath } from './hosting';
import { places, regions, sceneById, placeById } from './content';
import { defaultScenarioId, validScenario } from './street-content';
import { atlasFeatureById, atlasLayers, defaultAtlasLayers, normalizeAtlasLayers, type AtlasLayerId } from './atlas';
export interface Exploration { year: number; regionId: string | null; placeId: string | null; sceneId: string | null; view: 'map' | 'street'; scenarioId?: string | null; featureId?: string | null; atlasLayers?: AtlasLayerId[]; }
export const initialExploration: Exploration = {year:2018,regionId:null,placeId:null,sceneId:null,view:'map',scenarioId:null};
export function normalizeExploration(state: Exploration): Exploration {
  const feature=atlasFeatureById(state.featureId);const layers=normalizeAtlasLayers(state.atlasLayers);
  if(feature&&!layers.includes(feature.layer))layers.push(feature.layer);
  return {...state,...(feature?{regionId:null,placeId:null,sceneId:null,view:'map' as const}:{}),featureId:feature?.id||null,atlasLayers:normalizeAtlasLayers(layers),scenarioId:!feature&&state.view==='street'&&state.placeId?(validScenario(state.scenarioId,state.placeId,state.year)?state.scenarioId:defaultScenarioId(state.placeId,state.year)):null};
}
export function parseExploration(search: string): { state: Exploration; invalid: boolean } {
  const q = new URLSearchParams(search); const year = Number(q.get('year') || 2018);
  const scene = sceneById(q.get('scene')); let place = scene ? placeById(scene.placeId) : placeById(q.get('place'));
  // Old region-only street links land on a reviewed, useful neighborhood anchor.
  if(!place&&q.get('view')==='street')place=placeById(regions.find(r=>r.id===q.get('region'))?.streetEntryPlaceId);
  const region = place ? regions.find(r=>r.id===place.regionId) : regions.find(r=>r.id===q.get('region'));
  const layerIds=q.has('layers')?(q.get('layers')||'').split(',').filter(Boolean):undefined;
  const feature=atlasFeatureById(q.get('feature'));
  const invalid = (!!q.get('scene')&&!scene)|| (!!q.get('place')&&!places.some(p=>p.id===q.get('place'))) || (!!q.get('region')&&!regions.some(r=>r.id===q.get('region'))) || !Number.isInteger(year)||year<2015||year>2019 || (!!q.get('scenario')&&!validScenario(q.get('scenario'),place?.id,year)) || (!!q.get('feature')&&!feature) || !!layerIds?.some(id=>!atlasLayers.some(layer=>layer.id===id)) || !!(feature&&(q.has('region')||q.has('place')||q.has('scene')||q.has('scenario')));
  return { state:normalizeExploration({year:Number.isInteger(year)&&year>=2015&&year<=2019?year:2018,regionId:region?.id||null,placeId:place?.id||null,sceneId:scene?.id||null,view:q.get('view')==='map'?'map':place||q.get('view')==='street'&&region?'street':'map',scenarioId:q.get('scenario'),featureId:feature?.id,atlasLayers:normalizeAtlasLayers(layerIds)}),invalid };
}
export function explorationUrl(s: Exploration): string {
  const q = new URLSearchParams(); q.set('year',String(s.year));
  if(s.regionId) q.set('region',s.regionId); if(s.placeId) q.set('place',s.placeId); if(s.sceneId) q.set('scene',s.sceneId);
  if(s.scenarioId)q.set('scenario',s.scenarioId);
  if(s.featureId)q.set('feature',s.featureId);
  const layers=normalizeAtlasLayers(s.atlasLayers);if(layers.join(',')!==defaultAtlasLayers.join(','))q.set('layers',layers.join(','));
  if(!s.sceneId&&(s.placeId||s.view==='street'))q.set('view',s.view); return basePath+'?'+q.toString();
}
export function positionAlongRoad(points: number[][], phase: number): [number,number] {
  const lengths = points.slice(1).map((p,i)=>Math.hypot((p[0]-points[i][0])*Math.cos(p[1]*Math.PI/180),p[1]-points[i][1]));
  const total = lengths.reduce((a,b)=>a+b,0); let distance=Math.max(0,Math.min(1,phase))*total;
  for(let i=0;i<lengths.length;i++){if(distance<=lengths[i]||i===lengths.length-1){const t=lengths[i]?distance/lengths[i]:0;return [points[i][0]+(points[i+1][0]-points[i][0])*t,points[i][1]+(points[i+1][1]-points[i][1])*t];}distance-=lengths[i];}
  return [points[0][0],points[0][1]];
}
