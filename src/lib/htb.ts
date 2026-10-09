import { z } from 'astro/zod';

/** Nama kategori badge Academy yang jumlahnya sama dengan modul yang diselesaikan. */
export const MODULE_BADGE_CATEGORY = 'Module Completion Badges';

/** Jumlah hari di heatmap: 53 minggu. */
export const HEATMAP_DAYS = 371;

/** Riwayat harian yang lebih tua dari ini dibuang saat sync. */
const KEEP_DAYS = 400;

/**
 * Sync terjadwal jalan sesaat setelah tengah malam WIB. XP yang bertambah sejak sync
 * sebelumnya dicatat pada tanggal WIB "sekarang dikurangi jeda ini", jadi sync yang
 * terlambat beberapa jam tetap mencatat ke hari yang benar.
 */
const ATTRIBUTION_LAG_HOURS = 3;
const JAKARTA_OFFSET_HOURS = 7;
const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;

const count = z.number().int().nonnegative();
const dayKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/** Respons `/api/experience/v1/account/<accountId>` (hanya field yang dipakai). */
export const experienceSchema = z.object({
  level: count,
  levelTitle: z.string(),
  totalExperiencePoints: count,
  experienceUntilNextLevel: count,
  streakData: z.object({ counter: count, maxStreak: count }),
});

/** Respons `/public/profile/<profileId>/badges/academy` (hanya field yang dipakai). */
export const academyBadgesSchema = z.object({
  total_awarded: count,
  categories: z.array(z.object({ name: z.string(), total_awarded: count })),
});

/** Isi `src/data/htb-activity.json`. */
export const htbDataSchema = z.object({
  /** Waktu sync terakhir (ISO), `null` sebelum sync pertama. */
  syncedAt: z.iso.datetime().nullable(),
  /** Tanggal WIB sync pertama: riwayat harian baru ada sejak hari ini. */
  trackingSince: dayKey.nullable(),
  stats: z.object({
    level: count,
    levelTitle: z.string(),
    totalXp: count,
    xpToNextLevel: count,
    streak: count,
    maxStreak: count,
    academyModules: count,
    academyBadges: count,
  }),
  /** XP yang didapat per tanggal WIB (`YYYY-MM-DD`). */
  days: z.record(dayKey, count),
});

export type Experience = z.infer<typeof experienceSchema>;
export type AcademyBadges = z.infer<typeof academyBadgesSchema>;
export type HtbData = z.infer<typeof htbDataSchema>;

export const EMPTY_HTB_DATA: HtbData = {
  syncedAt: null,
  trackingSince: null,
  stats: {
    level: 0,
    levelTitle: '',
    totalXp: 0,
    xpToNextLevel: 0,
    streak: 0,
    maxStreak: 0,
    academyModules: 0,
    academyBadges: 0,
  },
  days: {},
};

/** Tanggal `YYYY-MM-DD` di zona Asia/Jakarta (UTC+7, tanpa DST). */
export function jakartaDay(date: Date): string {
  return new Date(date.getTime() + JAKARTA_OFFSET_HOURS * HOUR_MS).toISOString().slice(0, 10);
}

/** Membaca isi file data; data yang rusak atau tak dikenal menjadi data kosong. */
export function parseHtbData(raw: unknown): HtbData {
  const result = htbDataSchema.safeParse(raw);
  return result.success ? result.data : EMPTY_HTB_DATA;
}

/**
 * Menggabungkan hasil API ke data lama. HTB tidak membuka aktivitas harian, jadi
 * riwayat dibangun sendiri: selisih total XP sejak sync sebelumnya dicatat sebagai XP
 * satu hari. Riwayat lama tidak pernah ditimpa, hanya ditambah.
 */
export function applySync(
  previous: HtbData,
  experience: Experience,
  badges: AcademyBadges,
  now: Date,
): HtbData {
  const day = jakartaDay(new Date(now.getTime() - ATTRIBUTION_LAG_HOURS * HOUR_MS));
  const oldest = jakartaDay(new Date(now.getTime() - KEEP_DAYS * DAY_MS));
  const days = Object.fromEntries(Object.entries(previous.days).filter(([key]) => key >= oldest));

  // Sync pertama hanya mencatat titik awal: XP sebelum itu tidak diketahui tanggalnya.
  const gained =
    previous.syncedAt === null
      ? 0
      : Math.max(0, experience.totalExperiencePoints - previous.stats.totalXp);
  if (gained > 0) days[day] = (days[day] ?? 0) + gained;

  const modules = badges.categories.find((category) => category.name === MODULE_BADGE_CATEGORY);

  return {
    syncedAt: now.toISOString(),
    trackingSince: previous.trackingSince ?? day,
    stats: {
      level: experience.level,
      levelTitle: experience.levelTitle,
      totalXp: experience.totalExperiencePoints,
      xpToNextLevel: experience.experienceUntilNextLevel,
      streak: experience.streakData.counter,
      maxStreak: experience.streakData.maxStreak,
      academyModules: modules?.total_awarded ?? 0,
      academyBadges: badges.total_awarded,
    },
    days,
  };
}

export interface DayEntry {
  /** Tanggal WIB `YYYY-MM-DD`. */
  day: string;
  xp: number;
}

/** Deret XP harian sepanjang `length` hari yang berakhir di tanggal WIB `today`. */
export function dailySeries(
  days: Readonly<Record<string, number>>,
  today: Date,
  length = HEATMAP_DAYS,
): DayEntry[] {
  return Array.from({ length }, (_, index) => {
    const day = jakartaDay(new Date(today.getTime() - (length - 1 - index) * DAY_MS));
    return { day, xp: days[day] ?? 0 };
  });
}
