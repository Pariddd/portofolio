// Memeriksa hasil build terhadap CSP di _headers:
//   - setiap inline <script> harus punya hash sha256 di script-src,
//   - tidak boleh ada <style> inline atau atribut style="" (style-src 'self').
// Pakai: node scripts/check-csp.mjs [--print]
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST_DIR = fileURLToPath(new URL('../dist/', import.meta.url));
const HEADERS_FILE = join(DIST_DIR, '_headers');
const PRINT_ONLY = process.argv.includes('--print');

const SCRIPT_TAG = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
const STYLE_TAG = /<style\b/i;
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

/** @param {string} headers @returns {Set<string>} */
function allowedScriptHashes(headers) {
  const csp = /^\s*Content-Security-Policy:\s*(.+)$/im.exec(headers)?.[1] ?? '';
  const scriptSrc = csp.split(';').find((d) => d.trim().startsWith('script-src')) ?? '';
  return new Set([...scriptSrc.matchAll(/'(sha256-[A-Za-z0-9+/=]+)'/g)].map((m) => m[1]));
}

let htmlFiles;
let headers;
try {
  htmlFiles = findHtmlFiles(DIST_DIR);
  headers = readFileSync(HEADERS_FILE, 'utf8');
} catch {
  console.error('dist/ atau dist/_headers tidak ditemukan. Jalankan `npm run build` dulu.');
  process.exit(1);
}

const allowed = allowedScriptHashes(headers);
/** @type {Map<string, string[]>} hash → file yang memuatnya */
const found = new Map();
/** @type {string[]} */
const problems = [];

for (const file of htmlFiles) {
  const name = relative(DIST_DIR, file).replaceAll('\\', '/');
  const html = readFileSync(file, 'utf8');

  for (const [, attrs = '', body = ''] of html.matchAll(SCRIPT_TAG)) {
    if (/\bsrc\s*=/i.test(attrs) || NON_EXECUTABLE_TYPE.test(attrs)) continue;
    const hash = sha256(body);
    found.set(hash, [...(found.get(hash) ?? []), name]);
  }

  if (STYLE_TAG.test(html))
    problems.push(`${name}: ada <style> inline (diblokir style-src 'self')`);
  if (STYLE_ATTR.test(html))
    problems.push(`${name}: ada atribut style="" (diblokir style-src 'self')`);
}

if (PRINT_ONLY) {
  for (const [hash, files] of found) console.log(`'${hash}'  ← ${files.join(', ')}`);
  process.exit(0);
}

for (const [hash, files] of found) {
  if (!allowed.has(hash)) {
    problems.push(`${files.join(', ')}: inline script '${hash}' belum ada di script-src`);
  }
}
for (const hash of allowed) {
  if (!found.has(hash))
    problems.push(`_headers: hash '${hash}' tidak dipakai lagi, hapus dari CSP`);
}

if (problems.length > 0) {
  console.error(`CSP tidak cocok dengan hasil build:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(
  `CSP cocok: ${htmlFiles.length} halaman, ${found.size} inline script ter-hash, tanpa style inline.`,
);
