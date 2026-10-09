import { AsyncLocalStorage } from 'node:async_hooks';
const config = new AsyncLocalStorage<string | undefined>();
export const runWithMapConfig = <T>(key: string | undefined, run:()=>T):T => config.run(key,run);
export const getMapKey = () => config.getStore() || process.env.MAPTILER_KEY || '';
