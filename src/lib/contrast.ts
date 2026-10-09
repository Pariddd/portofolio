const HEX_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Mengubah `#rgb` / `#rrggbb` menjadi tiga kanal 0–255. */
export function parseHex(hex: string): [number, number, number] {
  const match = HEX_PATTERN.exec(hex.trim());
  const digits = match?.[1];
  if (digits === undefined) {
    throw new Error(`Warna hex tidak valid: "${hex}"`);
  }
  const full =
    digits.length === 3
      ? digits
          .split('')
          .map((c) => c + c)
          .join('')
      : digits;
  const value = Number.parseInt(full, 16);
  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
}

function linearize(channel: number): number {
  const s = channel / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

/** Luminans relatif WCAG 2.x (0 = hitam, 1 = putih). */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/** Rasio kontras WCAG 2.x antara dua warna hex (1–21). */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
