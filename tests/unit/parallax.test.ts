import { describe, expect, it } from 'vitest';
import { pointerOffset } from '../../src/lib/parallax';

describe('pointerOffset', () => {
  it('memetakan tepi dan tengah elemen ke −1, 0, 1', () => {
    expect(pointerOffset(100, 100, 400)).toBe(-1);
    expect(pointerOffset(300, 100, 400)).toBe(0);
    expect(pointerOffset(500, 100, 400)).toBe(1);
  });

  it('menjepit posisi di luar elemen', () => {
    expect(pointerOffset(0, 100, 400)).toBe(-1);
    expect(pointerOffset(900, 100, 400)).toBe(1);
  });

  it('mengembalikan 0 untuk elemen tanpa ukuran', () => {
    expect(pointerOffset(50, 0, 0)).toBe(0);
  });
});
