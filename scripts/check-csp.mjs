// Memeriksa hasil build terhadap CSP di _headers:
//   - setiap inline <script> harus punya hash sha256 di script-src,
//   - setiap <style> inline harus punya hash sha256 di style-src,
//   - tidak boleh ada atribut style="" (hash tidak berlaku untuk atribut).
// Pakai: node scripts/check-csp.mjs [--print]
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST_DIR = fileURLToPath(new URL('../dist/', import.meta.url));
const HEADERS_FILE = join(DIST_DIR, '_headers');
const PRINT_ONLY = process.argv.includes('--print');

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

/** @param {string} headers @param {string} directive @returns {Set<string>} */
function allowedHashes(headers, directive) {
  const csp = /^\s*Content-Security-Policy:\s*(.+)$/im.exec(headers)?.[1] ?? '';
  const source = csp.split(';').find((d) => d.trim().startsWith(`${directive} `)) ?? '';
  return new Set([...source.matchAll(/'(sha256-[A-Za-z0-9+/=]+)'/g)].map((m) => m[1]));
}

/** @param {Map<string, Set<string>>} found @param {string} hash @param {string} file */
function record(found, hash, file) {
  found.set(hash, (found.get(hash) ?? new Set()).add(file));
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

for (const file of htmlFiles) {
  const name = relative(DIST_DIR, file).replaceAll('\\', '/');
  const html = readFileSync(file, 'utf8');

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
  const allowed = allowedHashes(headers, directive);
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
  console.error(`CSP tidak cocok dengan hasil build:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(
  `CSP cocok: ${htmlFiles.length} halaman, ${scripts.size} inline script dan ${styles.size} <style> inline ter-hash, tanpa atribut style.`,
);
