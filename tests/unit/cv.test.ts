import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { PROFILE } from '../../src/data/profile';

// Tombol "Unduh CV" di hero selalu dirender. Pengecekan file dilakukan di sini, bukan saat
// build, karena build Cloudflare tidak bisa diandalkan membaca `public/` lewat `node:fs`.
describe('CV', () => {
  it('file PROFILE.cvPath ada di public/', () => {
    const file = fileURLToPath(new URL(`../../public${PROFILE.cvPath}`, import.meta.url));
    expect(existsSync(file)).toBe(true);
  });
});
