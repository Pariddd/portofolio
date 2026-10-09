// Mengambil progres Hack The Box (level, XP, streak, badge Academy) dari endpoint
// publik profil HTB dan menggabungkannya ke src/data/htb-activity.json.
// Tidak memakai token: semua endpoint terbuka untuk profil publik.
// Pakai: npm run sync:htb
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { ZodType } from 'astro/zod';
import { PROFILE } from '../src/data/profile.ts';
import { academyBadgesSchema, applySync, experienceSchema, parseHtbData } from '../src/lib/htb.ts';

const DATA_FILE = fileURLToPath(new URL('../src/data/htb-activity.json', import.meta.url));
const TIMEOUT_MS = 20_000;
const { accountId, profileId } = PROFILE.htb;

const ENDPOINTS = {
  experience: `https://labs.hackthebox.com/api/experience/v1/account/${accountId}`,
  badges: `https://profile.hackthebox.com/api/v1/public/profile/${profileId}/badges/academy`,
};

async function fetchJson<T>(url: string, schema: ZodType<T>): Promise<T> {
  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'portofolio-sync-htb' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`${url} menjawab ${response.status}`);
  const parsed = schema.safeParse(await response.json());
  if (!parsed.success) {
    throw new Error(`Bentuk respons ${url} berubah: ${parsed.error.message}`);
  }
  return parsed.data;
}

function readPrevious() {
  try {
    return parseHtbData(JSON.parse(readFileSync(DATA_FILE, 'utf8')));
  } catch {
    // File belum ada atau bukan JSON: mulai dari data kosong.
    return parseHtbData(null);
  }
}

// Bila salah satu permintaan gagal, script berhenti dengan kode 1 dan file lama dibiarkan.
const [experience, badges] = await Promise.all([
  fetchJson(ENDPOINTS.experience, experienceSchema),
  fetchJson(ENDPOINTS.badges, academyBadgesSchema),
]);
const next = applySync(readPrevious(), experience, badges, new Date());

writeFileSync(DATA_FILE, `${JSON.stringify(next, null, 2)}\n`);
console.log(
  `Sync HTB: level ${next.stats.level}, ${next.stats.totalXp} XP, streak ${next.stats.streak}, ` +
    `${next.stats.academyModules} modul Academy, ${Object.keys(next.days).length} hari tercatat.`,
);
