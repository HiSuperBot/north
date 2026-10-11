import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const site=fileURLToPath(new URL('.',import.meta.url));
export default defineConfig({
 root:fileURLToPath(new URL('./static-app',import.meta.url)),
 base:process.env.PAGES_BASE_PATH||'/north/',
 publicDir:fileURLToPath(new URL('./public',import.meta.url)),
 resolve:{alias:{'@':site}},
 plugins:[react()],
 define:{'import.meta.env.VITE_STATIC_HOSTING':JSON.stringify('true')},
 build:{outDir:fileURLToPath(new URL('./dist-pages',import.meta.url)),emptyOutDir:true},
});
