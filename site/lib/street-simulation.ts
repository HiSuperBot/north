import type { FeatureCollection } from 'geojson';
import { positionAlongRoad } from './exploration';

export interface PedestrianPlan {
  index: number;
  road: number[][];
  length: number;
  speed: number;
  wait: number;
  offset: number;
  loop: boolean;
}

const metresPerDegree = 111320;
function segmentLength(a: number[], b: number[]): number {
  return Math.hypot((b[0] - a[0]) * Math.cos(b[1] * Math.PI / 180), b[1] - a[1]) * metresPerDegree;
}

// Routes use source coordinates. Speeds, spacing, and endpoint rests are fictional.
export function planPedestrians(geometry: FeatureCollection, center: [number, number]): PedestrianPlan[] {
  const cosine = Math.cos(center[1] * Math.PI / 180);
  const candidates = geometry.features.flatMap((feature, featureIndex) => {
    if (feature.properties?.kind !== 'road' || feature.geometry.type !== 'LineString' ||
        ['motorway', 'motorway_link', 'trunk', 'trunk_link', 'steps'].includes(feature.properties.highway)) return [];
    const road = feature.geometry.coordinates;
    if (road.length < 2 || road.some(point => !Number.isFinite(point[0]) || !Number.isFinite(point[1]))) return [];
    let length = 0, nearest = Infinity, along = 0;
    for (let i = 1; i < road.length; i++) {
      const a = road[i - 1], b = road[i];
      const ax = (a[0] - center[0]) * cosine, ay = a[1] - center[1];
      const dx = (b[0] - a[0]) * cosine, dy = b[1] - a[1];
      const t = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / (dx * dx + dy * dy || 1)));
      const distance = Math.hypot(ax + t * dx, ay + t * dy) * metresPerDegree;
      const segment = segmentLength(a, b);
      if (distance < nearest) { nearest = distance; along = length + t * segment; }
      length += segment;
    }
    if (length < 35 || nearest > 450) return [];
    return [{ road, featureIndex, length, nearest, along }];
  }).sort((a, b) => a.nearest - b.nearest || a.featureIndex - b.featureIndex).slice(0, 8);

  return candidates.flatMap(({ road, featureIndex, length, along }) => {
    const count = Math.min(3, Math.max(1, Math.floor(length / 80)));
    const spacing = Math.min(90, length / (count + 1));
    const margin = spacing * (count - 1) / 2 + Math.min(10, length / 10);
    const middle = Math.max(margin, Math.min(length - margin, along));
    const loop = segmentLength(road[0], road[road.length - 1]) < 1;
    return Array.from({ length: count }, (_, slot) => {
      // The static extract's feature ordinal keeps identity stable across camera changes.
      const index = featureIndex * 4 + slot;
      const speed = 1.05 + (index % 5) * .1;
      const wait = 3 + index % 5;
      const distance = middle + (slot - (count - 1) / 2) * spacing;
      const offset = loop || index % 2 === 0 ? distance / speed : length / speed + wait + (length - distance) / speed;
      return { index, road, length, speed, wait, offset, loop };
    });
  });
}

export function pedestrianMotion(plan: PedestrianPlan, elapsed: number) {
  const leg = plan.length / plan.speed;
  const time = Math.max(0, elapsed) + plan.offset;
  if (plan.loop) return { position: positionAlongRoad(plan.road, (time % leg) / leg), walking: true, reverse: false };
  const phase = time % (2 * (leg + plan.wait));
  const returning = phase >= leg + plan.wait;
  const moving = phase < leg || (returning && phase < 2 * leg + plan.wait);
  const fraction = phase < leg ? phase / leg : returning ? Math.max(0, 1 - (phase - leg - plan.wait) / leg) : 1;
  return { position: positionAlongRoad(plan.road, fraction), walking: moving, reverse: returning };
}
