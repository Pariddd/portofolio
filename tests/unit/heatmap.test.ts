import { describe, expect, it } from 'vitest';
import { heatLevel, toWeeks } from '../../src/lib/heatmap';

describe('heatLevel', () => {
  it('memberi 0 untuk hari tanpa aktivitas atau max tidak valid', () => {
    expect(heatLevel(0, 8)).toBe(0);
    expect(heatLevel(-2, 8)).toBe(0);
    expect(heatLevel(3, 0)).toBe(0);
  });

  it('membagi rentang 1…max menjadi empat tingkat', () => {
    expect(heatLevel(1, 8)).toBe(1);
    expect(heatLevel(2, 8)).toBe(1);
    expect(heatLevel(3, 8)).toBe(2);
    expect(heatLevel(5, 8)).toBe(3);
    expect(heatLevel(8, 8)).toBe(4);
  });

  it('menjepit nilai di atas max ke tingkat 4', () => {
    expect(heatLevel(99, 8)).toBe(4);
  });
});

describe('toWeeks', () => {
  it('memecah menjadi kolom tujuh hari', () => {
    const weeks = toWeeks(Array.from({ length: 14 }, (_, i) => i));
    expect(weeks).toHaveLength(2);
    expect(weeks[1]).toEqual([7, 8, 9, 10, 11, 12, 13]);
  });

  it('menyisakan kolom terakhir yang tidak penuh', () => {
    const weeks = toWeeks([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(weeks).toHaveLength(2);
    expect(weeks[1]).toEqual([8, 9]);
  });

  it('mengembalikan array kosong untuk masukan kosong', () => {
    expect(toWeeks([])).toEqual([]);
  });
});
