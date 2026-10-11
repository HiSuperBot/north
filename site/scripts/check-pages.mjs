import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { loadLibrary } from './load-library.mjs';

const directory='dist-pages';
const base=process.env.PAGES_BASE_PATH||'/north/';
const html=await fs.readFile(path.join(directory,'index.html'),'utf8');
assert.ok(!html.includes('main.tsx'),'HTML must reference the production bundle');
for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)){
 assert.ok(match[1].startsWith(base),`Asset must use the configured Pages base: ${match[1]}`);
 await fs.access(path.join(directory,match[1].slice(base.length)));
}
const {scenes}=await loadLibrary('lib/content.ts');
for(const scene of scenes)await fs.access(path.join(directory,scene.image));
for(const asset of ['maplibre-worker.js','geography.geojson','neighborhoods.geojson','military-neighborhoods.geojson','sprites/tank.png','sprites/soldier-unarmed.png'])await fs.access(path.join(directory,asset));
const files=await fs.readdir(directory);
assert.ok(!files.some(f=>/^\.env|^\.git$|^server$|^\.openai$/.test(f)),'Static artifact must not contain runtime configuration or Git metadata');
console.log(`PASS: static production HTML, ${base} asset paths, all scene images, map worker/data, representative sprites and no server/private metadata.`);
