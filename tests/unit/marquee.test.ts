import { describe, expect, it } from 'vitest';
import { MIN_MARQUEE_COPIES, marqueeCopies, marqueeKeyframes } from '../../src/lib/marquee';

describe('marqueeCopies', () => {
  it('cukup dua salinan bila satu daftar lebih lebar dari wadah', () => {
    expect(marqueeCopies(360, 1170)).toBe(2);
  });

  it('menambah salinan di layar lebar supaya tidak ada ruang kosong', () => {
    expect(marqueeCopies(1366, 1170)).toBe(3);
    expect(marqueeCopies(1920, 1170)).toBe(3);
    expect(marqueeCopies(3840, 1170)).toBe(5);
  });

  it('sisa salinan selalu menutup wadah selama satu putaran', () => {
    for (const container of [320, 1170, 1171, 2560]) {
      const copies = marqueeCopies(container, 1170);
      expect((copies - 1) * 1170).toBeGreaterThanOrEqual(container);
    }
  });

  it('kembali ke minimum bila lebar daftar belum terukur', () => {
    expect(marqueeCopies(1920, 0)).toBe(MIN_MARQUEE_COPIES);
  });
});

describe('marqueeKeyframes', () => {
  it('menggeser tepat satu salinan', () => {
    expect(marqueeKeyframes(2)).toEqual(['translateX(0%)', 'translateX(-50.0000%)']);
    expect(marqueeKeyframes(3)).toEqual(['translateX(0%)', 'translateX(-33.3333%)']);
  });
});
