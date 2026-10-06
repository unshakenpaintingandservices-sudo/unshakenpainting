import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import { business } from './src/data/business.ts';
export default defineConfig({
  site: business.url,
  output: 'static',
  adapter: vercel(),
  trailingSlash: 'always',
  devToolbar: { enabled: false },
});
