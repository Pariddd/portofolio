export type HeatLevel = 0 | 1 | 2 | 3 | 4;

export const DAYS_PER_WEEK = 7;

/** Memetakan jumlah aktivitas sehari ke tingkat warna 0–4 relatif terhadap `max`. */
export function heatLevel(count: number, max: number): HeatLevel {
  if (count <= 0 || max <= 0) return 0;
  const level = Math.ceil((Math.min(count, max) / max) * 4);
  return Math.max(1, Math.min(4, level)) as HeatLevel;
}

/** Memecah deret harian menjadi kolom mingguan; kolom terakhir boleh kurang dari 7. */
export function toWeeks<T>(days: readonly T[]): T[][] {
  const weeks: T[][] = [];
  for (let start = 0; start < days.length; start += DAYS_PER_WEEK) {
    weeks.push(days.slice(start, start + DAYS_PER_WEEK));
  }
  return weeks;
}
