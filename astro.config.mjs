import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// Satu-satunya tempat domain didefinisikan. Ganti di sini saat domain asli tersedia.
const SITE_URL = 'https://faridkurniawan.pages.dev';

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  integrations: [react()],
  build: {
    // CSP memakai `style-src 'self'`, jadi tidak boleh ada <style> inline.
    inlineStylesheets: 'never',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
