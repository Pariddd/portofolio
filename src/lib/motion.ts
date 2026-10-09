/** Easing dari design system (CLAUDE.md §2), dalam bentuk yang diterima Motion. */
export const EASE_MAIN = [0.2, 0.7, 0.2, 1] as const;
export const EASE_REVEAL = [0.7, 0, 0.2, 1] as const;

/** Jeda bertingkat untuk item ke-`index`, dalam detik. */
export function staggerDelay(index: number, stepSeconds: number, startSeconds = 0): number {
  return startSeconds + Math.max(0, index) * stepSeconds;
}

/** Nilai `transform` untuk lapisan parallax: offset −1…1 dikali kedalaman (px). */
export function parallaxTransform(x: number, y: number, depth: number): string {
  return `translate(${(x * depth).toFixed(2)}px, ${(y * depth).toFixed(2)}px)`;
}

/** Pengguna meminta gerakan dikurangi. Hanya dipanggil di browser. */
export function prefersReducedMotion(): boolean {
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}
