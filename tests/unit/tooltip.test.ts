import { describe, expect, it } from 'vitest';
import { clampCenter } from '../../src/lib/tooltip';

describe('clampCenter', () => {
  it('membiarkan posisi yang sudah muat', () => {
    expect(clampCenter(200, 100, 400, 8)).toBe(200);
  });

  it('menggeser dari tepi kiri dan kanan', () => {
    expect(clampCenter(10, 100, 400, 8)).toBe(58);
    expect(clampCenter(395, 100, 400, 8)).toBe(342);
  });

  it('menaruh di tengah bila kotak lebih lebar dari viewport', () => {
    expect(clampCenter(10, 500, 400, 8)).toBe(200);
  });
});
