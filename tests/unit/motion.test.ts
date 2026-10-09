import { describe, expect, it } from 'vitest';
import { parallaxTransform, staggerDelay } from '../../src/lib/motion';

describe('staggerDelay', () => {
  it('menambah jeda per item', () => {
    expect(staggerDelay(0, 0.012)).toBe(0);
    expect(staggerDelay(10, 0.012)).toBeCloseTo(0.12);
  });

  it('memperhitungkan jeda awal', () => {
    expect(staggerDelay(2, 0.1, 1)).toBeCloseTo(1.2);
  });

  it('tidak menghasilkan jeda negatif untuk index negatif', () => {
    expect(staggerDelay(-3, 0.1, 0.5)).toBe(0.5);
  });
});

describe('parallaxTransform', () => {
  it('mengalikan offset dengan kedalaman', () => {
    expect(parallaxTransform(1, -0.5, 9.6)).toBe('translate(9.60px, -4.80px)');
  });

  it('diam di tengah', () => {
    expect(parallaxTransform(0, 0, 20.8)).toBe('translate(0.00px, 0.00px)');
  });
});
