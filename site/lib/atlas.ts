import review from '../content/map-reference-review.json';
import { sourceById, type EvidenceLevel, type Source } from './content';

export const atlasLayers = [
  { id: 'life', name: 'Markets & life', short: 'LI', color: '#d2aaaa' },
  { id: 'nature', name: 'Nature', short: 'NA', color: '#b4cf9a' },
  { id: 'heritage', name: 'Heritage', short: 'HE', color: '#d6c99c' },
  { id: 'transport', name: 'Ports & rail', short: 'TR', color: '#99bfca' },
  { id: 'space', name: 'Space launch', short: 'SP', color: '#b6a8d8' },
  { id: 'nuclear', name: 'Nuclear sites', short: 'NU', color: '#ddaf86' },
] as const;
export type AtlasLayerId = typeof atlasLayers[number]['id'];
export const defaultAtlasLayers: AtlasLayerId[] = atlasLayers.map(layer => layer.id);
export interface AtlasEvent { date: string; title: string; text: string; sourceIds: string[]; level: EvidenceLevel; }
export interface AtlasFeature {
  id: string; name: string; korean: string; layer: AtlasLayerId; coordinates: [number,number];
  spatialSourceIds: string[]; spatialNote: string; summary: string; limitations: string;
  events: AtlasEvent[]; entryPlaceId?: string;
}
export const atlasFeatures = (review.features as AtlasFeature[]).slice().sort((a,b)=>atlasLayers.findIndex(layer=>layer.id===a.layer)-atlasLayers.findIndex(layer=>layer.id===b.layer));
export const atlasFeatureById = (id?: string | null) => atlasFeatures.find(feature => feature.id === id);
export const atlasSourceById = (id: string): Source => (review.sources as Source[]).find(source => source.id === id) || sourceById(id);
export function normalizeAtlasLayers(ids?: string[]): AtlasLayerId[] {
  return atlasLayers.filter(layer => (ids || defaultAtlasLayers).includes(layer.id)).map(layer => layer.id);
}
export const atlasSourcesFor = (feature: AtlasFeature) => [...new Set([...feature.spatialSourceIds, ...feature.events.flatMap(event => event.sourceIds)])].map(atlasSourceById);
export const eventInSelectedYear = (event: AtlasEvent, year: number) => Number(event.date.slice(0,4)) === year;
export const recordAtYear = (feature: AtlasFeature, year: number) => feature.events.filter(event => Number(event.date.slice(0,4)) <= year).at(-1);
