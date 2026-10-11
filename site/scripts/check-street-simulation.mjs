import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { loadLibrary } from './load-library.mjs';
const {planPedestrians,pedestrianMotion}=await loadLibrary('lib/street-simulation.ts');
const {places}=await loadLibrary('lib/content.ts');
const geometry = JSON.parse(await fs.readFile('public/neighborhoods.geojson', 'utf8'));

function onRoad(point, road) {
  return road.slice(1).some((b, i) => {
    const a = road[i], dx = b[0] - a[0], dy = b[1] - a[1];
    const fraction = ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / (dx * dx + dy * dy || 1);
    return fraction >= -1e-8 && fraction <= 1 + 1e-8 && Math.hypot(point[0] - (a[0] + fraction * dx), point[1] - (a[1] + fraction * dy)) < 1e-9;
  });
}

let samples = 0;
for (const place of places.filter(p=>p.regionId!=='dmz'&&p.id!=='kim-il-sung-square')) {
  const plans = planPedestrians(geometry, place.coordinates);
  assert.ok(plans.length > 0 && plans.length <= 24, `${place.id}: invalid pedestrian budget`);
  assert.equal(new Set(plans.map(p => p.index)).size, plans.length);
  const shifted = planPedestrians(geometry, [place.coordinates[0] + .00005, place.coordinates[1]]);
  for (const plan of plans) {
    const same = shifted.find(p => p.index === plan.index);
    if (same) assert.deepEqual(same.road, plan.road, 'A camera shift must retain the source route for a retained identity');
    assert.ok(plan.length >= 35 && plan.speed >= 1 && plan.speed <= 1.5);
    for (let seconds = 0; seconds <= 2000; seconds += 13) {
      const motion = pedestrianMotion(plan, seconds);
      assert.ok(onRoad(motion.position, plan.road), `${place.id}: pedestrian left its mapped road`);
      samples++;
    }
  }
}

const road = (coordinates, highway = 'residential') => ({ type: 'Feature', properties: { kind: 'road', highway }, geometry: { type: 'LineString', coordinates } });
const fixture = { type: 'FeatureCollection', features: [
  road([[0, 0], [.002, 0]]),
  road([[0, 0], [.00001, 0]]),
  road([[0, 0], [.003, 0]], 'motorway'),
  road([[1, 1], [1.003, 1]]),
  road([[0, 0], [0, 0]]),
  road([[0, 0], [Number.NaN, 0]]),
] };
const plans = planPedestrians(fixture, [.001, 0]);
assert.equal(plans.length, 2, 'Short, high-speed, distant, degenerate and invalid roads are unsuitable');
assert.ok(Math.abs(pedestrianMotion(plans[0], 0).position[0] - pedestrianMotion(plans[1], 0).position[0]) * 111320 >= 70, 'Initial spacing must reflect road length');
assert.deepEqual(planPedestrians({ type: 'FeatureCollection', features: [] }, [0, 0]), []);

const line = { index: 0, road: [[0, 0], [.001, 0]], length: 100, speed: 1, wait: 5, offset: 0, loop: false };
assert.deepEqual(pedestrianMotion(line, 102), { position: [.001, 0], walking: false, reverse: false });
assert.deepEqual(pedestrianMotion(line, 207), { position: [0, 0], walking: false, reverse: true });
assert.equal(pedestrianMotion(line, 150).reverse, true);
assert.equal(pedestrianMotion(line, 212).walking, true);
const loop = { ...line, loop: true, road: [[0, 0], [.001, 0], [0, 0]] };
assert.deepEqual(pedestrianMotion(loop, 0).position, pedestrianMotion(loop, 100).position);
assert.equal(pedestrianMotion(loop, 102).walking, true);

console.log(`PASS: six mapped pedestrian pools, ${samples} on-road motion samples, stable route identities, spacing, unsuitable-road filtering, endpoint rests and closed loops.`);
