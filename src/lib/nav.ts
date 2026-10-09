/** Id section dari href navbar (`/#tentang` → `tentang`); `null` bila tanpa hash. */
export function sectionIdFromHref(href: string): string | null {
  const index = href.indexOf('#');
  if (index === -1) return null;
  const id = href.slice(index + 1);
  return id === '' ? null : id;
}

/**
 * Section yang dianggap aktif: yang terakhir (paling bawah) di antara yang bagian
 * atasnya sudah melewati `line` (px dari atas viewport). `tops` berisi posisi atas tiap
 * section menurut urutan halaman.
 */
export function activeSection(
  tops: readonly { id: string; top: number }[],
  line: number,
): string | null {
  let active: string | null = null;
  for (const { id, top } of tops) {
    if (top <= line) active = id;
  }
  return active;
}
