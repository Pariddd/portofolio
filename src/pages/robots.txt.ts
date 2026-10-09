import type { APIRoute } from 'astro';

// Dibuat saat build supaya alamat sitemap mengikuti `site` di astro.config.mjs.
export const GET: APIRoute = ({ site }) => {
  const lines = ['User-agent: *', 'Allow: /'];
  if (site !== undefined) lines.push('', `Sitemap: ${new URL('/sitemap.xml', site).href}`);
  return new Response(`${lines.join('\n')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
