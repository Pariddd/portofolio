import type { APIRoute } from 'astro';
import { sitemapXml } from '../lib/sitemap';

/** Halaman yang boleh diindeks. Halaman 404 sengaja tidak masuk. */
const PATHS = ['/'];

export const GET: APIRoute = ({ site }) => {
  if (site === undefined) return new Response('`site` belum diatur', { status: 500 });
  return new Response(sitemapXml(site, PATHS), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
