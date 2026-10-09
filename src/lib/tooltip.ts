/**
 * Posisi tengah mendatar untuk kotak selebar `width` supaya seluruhnya tetap di dalam
 * viewport selebar `viewport`, dengan jarak `gap` dari tepi.
 */
export function clampCenter(center: number, width: number, viewport: number, gap = 0): number {
  const half = width / 2;
  const min = gap + half;
  const max = viewport - gap - half;
  // Kotak lebih lebar dari ruang yang ada: taruh di tengah viewport.
  if (min > max) return viewport / 2;
  return Math.min(max, Math.max(min, center));
}
