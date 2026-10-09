/**
 * DATA CONTOH untuk heatmap sampai sync Hack The Box (F9) menulis
 * `htb-activity.json`. Deretnya acak-semu dengan benih tetap supaya hasil build
 * selalu sama; ini bukan aktivitas nyata dan section-nya diberi label "data contoh".
 */
const SAMPLE_DAYS = 371;
const SAMPLE_SEED = 23;

function sampleCounts(days: number, seed: number): number[] {
  const counts: number[] = [];
  let state = seed;
  for (let day = 0; day < days; day++) {
    state = (state * 9301 + 49297) % 233280;
    const roll = state / 233280;
    counts.push(roll < 0.5 ? 0 : roll < 0.72 ? 1 : roll < 0.86 ? 2 : roll < 0.95 ? 3 : 4);
  }
  return counts;
}

export const HTB_SAMPLE_COUNTS: readonly number[] = sampleCounts(SAMPLE_DAYS, SAMPLE_SEED);
