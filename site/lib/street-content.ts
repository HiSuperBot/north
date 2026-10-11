import type { Claim } from './content';
import type { DioramaAssetId } from './diorama-catalog';

export type StreetCategory = 'people' | 'transport' | 'places';
export type StreetEntityType = 'soldier' | 'vendor' | 'porter' | 'cyclist' | 'bus' | 'truck' | 'train' | 'cart' | 'tank' | 'workbench' | 'conference' | 'panmungak' | 'boundary';
export interface StreetScenario {
  id: string;
  title: string;
  placeIds: string[];
  years: number[];
  period: string;
  description: string;
  sourceIds: string[];
  military?: boolean;
}
export interface StreetEntity {
  id: string;
  type: StreetEntityType;
  category: StreetCategory;
  title: string;
  description: string;
  sprite?: string;
  visualAssetId?: DioramaAssetId;
  photograph?: string;
  photographSourceId?: string;
  period: string;
  position: [number, number];
  route?: number[][];
  speed?: number;
  offset?: number;
  role?: string;
  activity?: string;
  thoughts?: string[];
  claims: Claim[];
}
export interface BuildingInfo {
  id: string; name: string; building: string; levels: string; height: number;
  heightSource: string; sourceUrl: string; captured?:string; timestamp: string; longitude: number; latitude: number;
}
export type StreetSelection =
  | { kind: 'person'; index: number }
  | { kind: 'entity'; entity: StreetEntity }
  | { kind: 'building'; building: BuildingInfo }
  | { kind: 'place'; placeId: string };
export type StreetFilters = Record<StreetCategory, boolean>;
export const initialStreetFilters: StreetFilters = { people: true, transport: true, places: true };

export const streetScenarios: StreetScenario[] = [
  { id: 'pyongyang-life', title: 'Everyday city life', placeIds: ['kwangbok-apartment', 'pyongyang-transit', 'kwangbok-store'], years: [2015,2016,2017,2018,2019], period: 'Regional scenario · 2015–2019', description: 'Imagined journeys, errands and sales on the mapped ground. No actual routes or service timetable are represented.', sourceIds: ['bus-photo', 'shop-photo'] },
  { id: 'aoji-life', title: 'Work and neighborhood life', placeIds: ['aoji-coal', 'haksong-rail', 'haksong-housing'], years: [2015,2016,2017,2018,2019], period: 'Regional scenario · 2015–2019', description: 'Imagined surface work and freight activity. Regional references retain their original locations and dates.', sourceIds: ['namyang-rail', 'mine-location'] },
  { id: 'jsa-guard', title: 'At the border', placeIds: ['panmunjom-jsa'], years: [2015,2016,2017], period: 'Guard scenario · context photographed 8 December 2017', description: 'Fictional guards around documented public landmarks. The reference does not establish a deployment or routine in every selected year.', sourceIds: ['jsa-guard-photo', 'jsa-photo'], military: true },
  { id: 'jsa-before', title: 'Before demilitarization', placeIds: ['panmunjom-jsa'], years: [2018], period: 'Context · 19 June 2018', description: 'A pre-demilitarization context informed by the dated JSA photograph. Rendered guards, movements and thoughts are fictional.', sourceIds: ['jsa-photo', 'jsa-guard-photo'], military: true },
  { id: 'jsa-after', title: 'After demilitarization', placeIds: ['panmunjom-jsa'], years: [2018,2019], period: 'Context · verified 29 October 2018', description: 'Unarmed illustrative guards reflect the documented removal of weapons. Their number and positions are not an observed roster. Applying this context to 2019 is an inference.', sourceIds: ['jsa-demilitarization', 'jsa-photo'], military: true },
  { id: 'parade-2015', title: 'The 2015 parade', placeIds: ['kim-il-sung-square'], years: [2015], period: 'Recorded event · 10 October 2015', description: 'A reconstruction of the documented military parade. Vehicle movement, formations and individual thoughts are illustrative.', sourceIds: ['parade-photo', 'tank-photo', 'parade-event-record'], military: true },
  { id: 'square-reference', title: 'Explore the square', placeIds: ['kim-il-sung-square'], years: [2016,2017,2018,2019], period: 'Spatial reference · historical appearance inferred', description: 'The square can be explored in this scenario year. The 2015 parade is available through its dated event entry.', sourceIds: ['parade-photo', 'military-osm'] },
];

export const scenarioById = (id?: string | null) => streetScenarios.find(s => s.id === id);
export function defaultScenarioId(placeId: string | null | undefined, year: number): string | null {
  if(placeId==='panmunjom-jsa'&&year>=2018)return 'jsa-after';
  return streetScenarios.find(s => s.placeIds.includes(placeId || '') && s.years.includes(year))?.id || null;
}
export function validScenario(id: string | null | undefined, placeId: string | null | undefined, year: number) {
  const scenario = scenarioById(id);
  return !!scenario && scenario.placeIds.includes(placeId || '') && scenario.years.includes(year);
}
export function scenarioFor(placeId: string | null | undefined, year: number, id?: string | null) {
  return scenarioById(validScenario(id, placeId, year) ? id : defaultScenarioId(placeId, year));
}

export const reconstructionClaim: Claim = { element: 'Rendered activity and object placement', level: 'AI Reconstruction', description: 'This miniature, activity and placement are fictional. Neither a mapped road nor a reference photograph proves that this object or person was here at this time.', sourceIds: [] };
