/**
 * Posisi pointer relatif terhadap satu sisi elemen, dinormalkan ke −1…1
 * (−1 = tepi awal, 0 = tengah, 1 = tepi akhir) dan dijepit di rentang itu.
 */
export function pointerOffset(position: number, start: number, size: number): number {
  if (size <= 0) return 0;
  const offset = ((position - start) / size - 0.5) * 2;
  return Math.max(-1, Math.min(1, offset));
}
