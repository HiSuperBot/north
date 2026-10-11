// Both hosting targets use the same explorer. Vite replaces these public values
// at build time; the Sites build keeps '/' and its runtime map configuration.
export const basePath=import.meta.env?.BASE_URL||'/';
export const staticHosting=import.meta.env?.VITE_STATIC_HOSTING==='true';
export const staticMapKey=import.meta.env?.VITE_MAPTILER_KEY||'';
export function assetUrl(path:string){return /^https?:|^data:/.test(path)?path:basePath+path.replace(/^\//,'');}
