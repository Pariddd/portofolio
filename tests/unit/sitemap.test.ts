import { describe, expect, it } from 'vitest';
import { sitemapXml } from '../../src/lib/sitemap';

const SITE = new URL('https://contoh.test');

describe('sitemapXml', () => {
  it('menulis alamat lengkap tiap halaman', () => {
    const xml = sitemapXml(SITE, ['/', '/tentang/']);
    expect(xml).toContain('<loc>https://contoh.test/</loc>');
    expect(xml).toContain('<loc>https://contoh.test/tentang/</loc>');
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
  });

  it('meng-escape karakter khusus XML', () => {
    expect(sitemapXml(SITE, ['/cari?a=1&b=2'])).toContain(
      '<loc>https://contoh.test/cari?a=1&amp;b=2</loc>',
    );
  });
});
