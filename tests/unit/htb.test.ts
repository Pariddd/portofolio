import { describe, expect, it } from 'vitest';
import {
  EMPTY_HTB_DATA,
  MODULE_BADGE_CATEGORY,
  applySync,
  dailySeries,
  jakartaDay,
  parseHtbData,
  type AcademyBadges,
  type Experience,
  type HtbData,
} from '../../src/lib/htb';

const experience = (totalXp: number): Experience => ({
  level: 2,
  levelTitle: 'Beginner',
  totalExperiencePoints: totalXp,
  experienceUntilNextLevel: 50,
  streakData: { counter: 3, maxStreak: 5 },
});

const badges: AcademyBadges = {
  total_awarded: 4,
  categories: [
    { name: MODULE_BADGE_CATEGORY, total_awarded: 3 },
    { name: 'Lainnya', total_awarded: 1 },
  ],
};

// 00.10 WIB tanggal 10 Oktober = 17.10 UTC tanggal 9 Oktober.
const MIDNIGHT_RUN = new Date('2026-10-09T17:10:00Z');

describe('jakartaDay', () => {
  it('memakai tanggal WIB, bukan UTC', () => {
    expect(jakartaDay(new Date('2026-10-09T16:59:00Z'))).toBe('2026-10-09');
    expect(jakartaDay(new Date('2026-10-09T17:00:00Z'))).toBe('2026-10-10');
  });
});

describe('applySync', () => {
  it('sync pertama hanya mencatat titik awal', () => {
    const data = applySync(EMPTY_HTB_DATA, experience(500), badges, MIDNIGHT_RUN);
    expect(data.days).toEqual({});
    expect(data.trackingSince).toBe('2026-10-09');
    expect(data.stats.totalXp).toBe(500);
    expect(data.stats.academyModules).toBe(3);
    expect(data.stats.academyBadges).toBe(4);
    expect(data.syncedAt).toBe(MIDNIGHT_RUN.toISOString());
  });

  it('sync sesaat setelah tengah malam mencatat selisih XP ke hari sebelumnya', () => {
    const first = applySync(EMPTY_HTB_DATA, experience(500), badges, MIDNIGHT_RUN);
    const nextNight = new Date('2026-10-10T17:25:00Z');
    const second = applySync(first, experience(620), badges, nextNight);
    expect(second.days).toEqual({ '2026-10-10': 120 });
    expect(second.trackingSince).toBe('2026-10-09');
  });

  it('sync manual di siang hari mencatat ke hari itu dan menambah, bukan menimpa', () => {
    const base: HtbData = {
      ...applySync(EMPTY_HTB_DATA, experience(500), badges, MIDNIGHT_RUN),
      days: { '2026-10-10': 40 },
    };
    const noon = new Date('2026-10-10T08:00:00Z');
    expect(applySync(base, experience(530), badges, noon).days).toEqual({ '2026-10-10': 70 });
  });

  it('tidak mencatat hari tanpa XP baru atau bila total XP turun', () => {
    const first = applySync(EMPTY_HTB_DATA, experience(500), badges, MIDNIGHT_RUN);
    const later = new Date('2026-10-10T17:10:00Z');
    expect(applySync(first, experience(500), badges, later).days).toEqual({});
    expect(applySync(first, experience(100), badges, later).days).toEqual({});
  });

  it('membuang riwayat yang lebih tua dari batas simpan', () => {
    const base: HtbData = {
      ...applySync(EMPTY_HTB_DATA, experience(500), badges, MIDNIGHT_RUN),
      days: { '2024-01-01': 10, '2026-10-01': 20 },
    };
    const later = new Date('2026-10-10T17:10:00Z');
    expect(applySync(base, experience(500), badges, later).days).toEqual({ '2026-10-01': 20 });
  });

  it('modul dihitung nol bila kategorinya tidak ada', () => {
    const data = applySync(
      EMPTY_HTB_DATA,
      experience(0),
      { total_awarded: 0, categories: [] },
      MIDNIGHT_RUN,
    );
    expect(data.stats.academyModules).toBe(0);
  });
});

describe('dailySeries', () => {
  it('berakhir di hari ini dan mengisi hari kosong dengan nol', () => {
    const today = new Date('2026-10-10T05:00:00Z');
    expect(dailySeries({ '2026-10-10': 7, '2026-10-08': 3 }, today, 4)).toEqual([
      { day: '2026-10-07', xp: 0 },
      { day: '2026-10-08', xp: 3 },
      { day: '2026-10-09', xp: 0 },
      { day: '2026-10-10', xp: 7 },
    ]);
  });
});

describe('parseHtbData', () => {
  it('menerima data yang sah', () => {
    const data = applySync(EMPTY_HTB_DATA, experience(500), badges, MIDNIGHT_RUN);
    expect(parseHtbData(JSON.parse(JSON.stringify(data)))).toEqual(data);
  });

  it('mengembalikan data kosong untuk isi yang rusak', () => {
    expect(parseHtbData({ days: { 'bukan-tanggal': -1 } })).toEqual(EMPTY_HTB_DATA);
    expect(parseHtbData(null)).toEqual(EMPTY_HTB_DATA);
  });
});
