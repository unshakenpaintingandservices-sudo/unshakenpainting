import { defineConfig } from 'astro/config';
import { business } from './src/data/business.ts';
export default defineConfig({
  site: business.url,
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
});
