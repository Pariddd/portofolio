// Memeriksa hasil build terhadap CSP di _headers:
//   - setiap inline <script> harus punya hash sha256 di script-src,
//   - setiap <style> inline harus punya hash sha256 di style-src,
//   - tidak boleh ada atribut style="" (hash tidak berlaku untuk atribut).
// Dengan --live, halaman dan header CSP diambil dari situs yang terdeploy (`site` di
// astro.config.mjs), karena build di Cloudflare bisa berbeda dari build lokal/CI.
// Pakai: node scripts/check-csp.mjs [--live] [--print]
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST_DIR = fileURLToPath(new URL('../dist/', import.meta.url));
const HEADERS_FILE = join(DIST_DIR, '_headers');
const PRINT_ONLY = process.argv.includes('--print');
const LIVE = process.argv.includes('--live');
// Beranda dan halaman 404 (path yang sengaja tidak ada).
const LIVE_PATHS = ['/', '/__cek-csp-404'];
const TIMEOUT_MS = 20_000;

const SCRIPT_TAG = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
const STYLE_TAG = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
const STYLE_ATTR = /<[a-z][^>]*\sstyle\s*=/i;
// Blok data (JSON, importmap, dsb.) tidak dieksekusi sehingga tidak butuh hash.
const NON_EXECUTABLE_TYPE =
  /\btype\s*=\s*["']?(application\/(ld\+)?json|importmap|speculationrules)/i;

/** @param {string} dir @returns {string[]} */
function findHtmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return findHtmlFiles(path);
    return entry.name.endsWith('.html') ? [path] : [];
  });
}

/** @param {string} content */
function sha256(content) {
  return `sha256-${createHash('sha256').update(content, 'utf8').digest('base64')}`;
}

/** @param {string} csp @param {string} directive @returns {Set<string>} */
function allowedHashes(csp, directive) {
  const source = csp.split(';').find((d) => d.trim().startsWith(`${directive} `)) ?? '';
  return new Set([...source.matchAll(/'(sha256-[A-Za-z0-9+/=]+)'/g)].map((m) => m[1]));
}

/** @param {Map<string, Set<string>>} found @param {string} hash @param {string} file */
function record(found, hash, file) {
  found.set(hash, (found.get(hash) ?? new Set()).add(file));
}

/** @typedef {{ name: string, html: string, csp: string }} Page */

/** @returns {Page[]} */
function loadDistPages() {
  try {
    const headers = readFileSync(HEADERS_FILE, 'utf8');
    const csp = /^\s*Content-Security-Policy:\s*(.+)$/im.exec(headers)?.[1] ?? '';
    return findHtmlFiles(DIST_DIR).map((file) => ({
      name: relative(DIST_DIR, file).replaceAll('\\', '/'),
      html: readFileSync(file, 'utf8'),
      csp,
    }));
  } catch {
    console.error('dist/ atau dist/_headers tidak ditemukan. Jalankan `npm run build` dulu.');
    process.exit(1);
  }
}

/** @returns {Promise<Page[]>} */
async function loadLivePages() {
  const { default: config } = await import('../astro.config.mjs');
  if (!config.site) {
    console.error('`site` belum diisi di astro.config.mjs.');
    process.exit(1);
  }
  const site = config.site;
  try {
    return await Promise.all(
      LIVE_PATHS.map(async (path) => {
        const url = new URL(path, site);
        const response = await fetch(url, {
          headers: { 'Cache-Control': 'no-cache' },
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });
        return {
          name: url.href,
          html: await response.text(),
          csp: response.headers.get('content-security-policy') ?? '',
        };
      }),
    );
  } catch (error) {
    console.error(`Gagal mengambil ${site}: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}

const pages = LIVE ? await loadLivePages() : loadDistPages();
// Semua halaman memakai satu CSP yang sama dari _headers.
const csp = pages[0]?.csp ?? '';

/** @type {Map<string, Set<string>>} hash → file yang memuatnya */
const scripts = new Map();
/** @type {Map<string, Set<string>>} */
const styles = new Map();
const CHECKS = [
  { directive: 'script-src', label: 'inline script', found: scripts },
  { directive: 'style-src', label: '<style> inline', found: styles },
];
/** @type {string[]} */
const problems = [];

if (csp === '') problems.push('Content-Security-Policy tidak ditemukan');
for (const { name, html, csp: pageCsp } of pages) {
  if (pageCsp !== csp) problems.push(`${name}: CSP berbeda dari halaman lain`);

  for (const [, attrs = '', body = ''] of html.matchAll(SCRIPT_TAG)) {
    if (/\bsrc\s*=/i.test(attrs) || NON_EXECUTABLE_TYPE.test(attrs)) continue;
    record(scripts, sha256(body), name);
  }

  for (const [, body = ''] of html.matchAll(STYLE_TAG)) {
    record(styles, sha256(body), name);
  }

  if (STYLE_ATTR.test(html)) problems.push(`${name}: ada atribut style="" (diblokir style-src)`);
}

if (PRINT_ONLY) {
  for (const { directive, found } of CHECKS) {
    for (const [hash, files] of found) {
      console.log(`${directive} '${hash}'  ← ${[...files].join(', ')}`);
    }
  }
  process.exit(0);
}

for (const { directive, label, found } of CHECKS) {
  const allowed = allowedHashes(csp, directive);
  for (const [hash, files] of found) {
    if (!allowed.has(hash)) {
      problems.push(`${[...files].join(', ')}: ${label} '${hash}' belum ada di ${directive}`);
    }
  }
  for (const hash of allowed) {
    if (!found.has(hash)) {
      problems.push(`_headers: hash '${hash}' di ${directive} tidak dipakai lagi, hapus dari CSP`);
    }
  }
}

if (problems.length > 0) {
  const target = LIVE ? 'situs live' : 'hasil build';
  console.error(`CSP tidak cocok dengan ${target}:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(
  `CSP cocok${LIVE ? ' (live)' : ''}: ${pages.length} halaman, ${scripts.size} inline script dan ${styles.size} <style> inline ter-hash, tanpa atribut style.`,
);
