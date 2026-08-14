// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://iqverse.net',
  output: 'static',
  build: {
    format: 'directory',
  },
  trailingSlash: 'always',
});
