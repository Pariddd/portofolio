import { describe, expect, it } from 'vitest';
import { contrastRatio, parseHex, relativeLuminance } from '../../src/lib/contrast';

describe('parseHex', () => {
  it('membaca format 6 digit', () => {
    expect(parseHex('#0E7C7B')).toEqual([14, 124, 123]);
  });

  it('membaca format 3 digit dan tanpa #', () => {
    expect(parseHex('fff')).toEqual([255, 255, 255]);
  });

  it('menolak nilai yang bukan hex', () => {
    expect(() => parseHex('teal')).toThrow();
    expect(() => parseHex('#12345')).toThrow();
  });
});

describe('relativeLuminance', () => {
  it('hitam = 0 dan putih = 1', () => {
    expect(relativeLuminance('#000000')).toBe(0);
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 10);
  });
});

describe('contrastRatio', () => {
  it('hitam terhadap putih = 21', () => {
    expect(contrastRatio('#000', '#fff')).toBeCloseTo(21, 10);
  });

  it('warna yang sama = 1', () => {
    expect(contrastRatio('#0E7C7B', '#0e7c7b')).toBe(1);
  });

  it('tidak bergantung urutan argumen', () => {
    expect(contrastRatio('#101718', '#EFF3F2')).toBe(contrastRatio('#EFF3F2', '#101718'));
  });

  it('cocok dengan nilai acuan WCAG (#767676 di atas putih ≈ 4.54)', () => {
    expect(contrastRatio('#767676', '#ffffff')).toBeCloseTo(4.54, 2);
  });
});
