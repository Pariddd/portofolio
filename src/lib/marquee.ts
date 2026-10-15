/** Salinan minimum: satu yang terlihat dan satu yang menyusul masuk. */
export const MIN_MARQUEE_COPIES = 2;

/**
 * Jumlah salinan daftar agar marquee tidak pernah menampilkan ruang kosong. Track digeser
 * tepat satu salinan per putaran, jadi sisa salinan lainnya harus selebar wadah.
 */
export function marqueeCopies(containerWidth: number, listWidth: number): number {
  if (listWidth <= 0) return MIN_MARQUEE_COPIES;
  return Math.max(MIN_MARQUEE_COPIES, Math.ceil(containerWidth / listWidth) + 1);
}

/** Keyframe `transform` yang menggeser track sejauh satu dari `copies` salinan. */
export function marqueeKeyframes(copies: number): [string, string] {
  return ['translateX(0%)', `translateX(${(-100 / copies).toFixed(4)}%)`];
}
