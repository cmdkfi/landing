// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  integrations: [react()],
  site: 'https://cmdk.fi',
  trailingSlash: 'never',
  // The concept page moved to / on 14 Nov 2026; old /1 links land on it.
  redirects: { '/1': '/' },
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    format: 'file',
    inlineStylesheets: 'auto',
  },
});
