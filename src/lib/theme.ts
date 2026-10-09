export type Theme = 'light' | 'dark';

/** Kunci localStorage; harus sama dengan script tema inline di BaseLayout. */
export const THEME_STORAGE_KEY = 'theme';

/** Nilai dari storage bisa apa saja; hanya `light`/`dark` yang dianggap pilihan pengguna. */
export function parseStoredTheme(value: string | null): Theme | null {
  return value === 'light' || value === 'dark' ? value : null;
}

/** Pilihan tersimpan menang; tanpa pilihan, ikuti preferensi sistem. */
export function resolveTheme(stored: string | null, prefersDark: boolean): Theme {
  return parseStoredTheme(stored) ?? (prefersDark ? 'dark' : 'light');
}

export function oppositeTheme(theme: Theme): Theme {
  return theme === 'dark' ? 'light' : 'dark';
}
