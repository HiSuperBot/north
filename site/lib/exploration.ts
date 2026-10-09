import { places, regions, sceneById, placeById } from './content';
export interface Exploration { year: number; regionId: string | null; placeId: string | null; sceneId: string | null; view: 'map' | 'street'; }
export const initialExploration: Exploration = {year:2018,regionId:null,placeId:null,sceneId:null,view:'map'};
export function parseExploration(search: string): { state: Exploration; invalid: boolean } {
  const q = new URLSearchParams(search); const year = Number(q.get('year') || 2018);
  const scene = sceneById(q.get('scene')); const place = scene ? placeById(scene.placeId) : placeById(q.get('place'));
  const region = place ? regions.find(r=>r.id===place.regionId) : regions.find(r=>r.id===q.get('region'));
  const invalid = (!!q.get('scene')&&!scene)|| (!!q.get('place')&&!places.some(p=>p.id===q.get('place'))) || (!!q.get('region')&&!regions.some(r=>r.id===q.get('region'))) || !Number.isInteger(year)||year<2015||year>2019;
  return { state:{year:Number.isInteger(year)&&year>=2015&&year<=2019?year:2018,regionId:region?.id||null,placeId:place?.id||null,sceneId:scene?.id||null,view:q.get('view')==='map'?'map':place||q.get('view')==='street'&&region?'street':'map'},invalid };
}
export function explorationUrl(s: Exploration): string {
  const q = new URLSearchParams(); q.set('year',String(s.year));
  if(s.regionId) q.set('region',s.regionId); if(s.placeId) q.set('place',s.placeId); if(s.sceneId) q.set('scene',s.sceneId);
  if(!s.sceneId&&(s.placeId||s.view==='street'))q.set('view',s.view); return '/?'+q.toString();
}
export function positionAlongRoad(points: number[][], phase: number): [number,number] {
  const lengths = points.slice(1).map((p,i)=>Math.hypot((p[0]-points[i][0])*Math.cos(p[1]*Math.PI/180),p[1]-points[i][1]));
  const total = lengths.reduce((a,b)=>a+b,0); let distance=Math.max(0,Math.min(1,phase))*total;
  for(let i=0;i<lengths.length;i++){if(distance<=lengths[i]||i===lengths.length-1){const t=lengths[i]?distance/lengths[i]:0;return [points[i][0]+(points[i+1][0]-points[i][0])*t,points[i][1]+(points[i+1][1]-points[i][1])*t];}distance-=lengths[i];}
  return [points[0][0],points[0][1]];
}
