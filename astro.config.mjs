// @ts-check
import { defineConfig } from 'astro/config';
import viteCompression from 'vite-plugin-compression';

// https://astro.build/config
export default defineConfig({
  compressHTML: true,
  vite: {
    plugins: [
      viteCompression({ algorithm: 'gzip', ext: '.gz' }),
      viteCompression({ algorithm: 'brotliCompress', ext: '.br' }),
    ],
  },
});
