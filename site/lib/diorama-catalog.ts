/** Visual reconstruction assets; the catalog never changes historical claims. */
export const dioramaPlaceIds = ['kwangbok-apartment', 'pyongyang-transit', 'kwangbok-store'] as const;
export const isDioramaPlace = (id?: string | null) => dioramaPlaceIds.some(place => place === id);
export const dioramaAssetIds = ['apartment-cylinder', 'apartment-block', 'storefront', 'resident', 'commuter', 'porter', 'vendor', 'cyclist', 'bus', 'shelter', 'streetlamp', 'tree', 'bench'] as const;
export type DioramaAssetId = typeof dioramaAssetIds[number];
export const dioramaAsset = (id: DioramaAssetId) => ({ id, model: `/models/pyongyang/v1/${id}.glb`, thumbnail: `/thumbnails/pyongyang/${id}.webp`, provenance: 'AI Reconstruction' as const });
export const residentAsset = (placeId: string | null, index: number): DioramaAssetId => placeId === 'pyongyang-transit' || index % 3 === 0 ? 'commuter' : 'resident';
/** Only this independently reviewed feature may receive the photo-informed cylinder. */
export const cylinderFeatureId = '210296271';
export const cylinderIllustrativeHeight = 36;
export const dioramaStreetZoom = (placeId?: string | null, defaultZoom = 16.6) => isDioramaPlace(placeId) ? 17.6 : defaultZoom;
/** +Z is forward; local map axes are east, up, south. */
export function dioramaHeading(from: number[], to: number[], latitude: number) {
  const east = (to[0] - from[0]) * Math.cos(latitude * Math.PI / 180), south = from[1] - to[1];
  return east || south ? Math.atan2(east, south) : null;
}
