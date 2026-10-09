import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  oppositeTheme,
  parseStoredTheme,
  resolveTheme,
  THEME_STORAGE_KEY,
} from '../../src/lib/theme';

describe('parseStoredTheme', () => {
  it('menerima light dan dark', () => {
    expect(parseStoredTheme('light')).toBe('light');
    expect(parseStoredTheme('dark')).toBe('dark');
  });

  it.each([null, '', 'DARK', 'system', '<script>'])('menolak nilai %j', (value) => {
    expect(parseStoredTheme(value)).toBeNull();
  });
});

describe('resolveTheme', () => {
  it('mengutamakan pilihan tersimpan di atas preferensi sistem', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });

  it('mengikuti preferensi sistem bila belum ada pilihan', () => {
    expect(resolveTheme(null, true)).toBe('dark');
    expect(resolveTheme(null, false)).toBe('light');
  });

  it('mengabaikan nilai tersimpan yang tidak valid', () => {
    expect(resolveTheme('ungu', true)).toBe('dark');
    expect(resolveTheme('ungu', false)).toBe('light');
  });
});

describe('oppositeTheme', () => {
  it('membalik tema', () => {
    expect(oppositeTheme('light')).toBe('dark');
    expect(oppositeTheme('dark')).toBe('light');
  });
});

describe('script tema inline', () => {
  it('memakai kunci storage yang sama dengan THEME_STORAGE_KEY', () => {
    const layout = readFileSync(
      new URL('../../src/layouts/BaseLayout.astro', import.meta.url),
      'utf8',
    );
    expect(layout).toContain(`localStorage.getItem('${THEME_STORAGE_KEY}')`);
  });
});
