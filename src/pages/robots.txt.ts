import type { APIRoute } from 'astro';
import { business } from '../data/business';
export const GET: APIRoute = () =>
  new Response(
    `User-agent: *\n${import.meta.env.PUBLIC_SITE_LAUNCH_READY === 'true' ? 'Allow: /' : 'Disallow: /'}\nSitemap: ${business.url}/sitemap.xml\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
