// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vue from '@astrojs/vue';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  site: 'https://refearnapp.com',
  integrations: [vue(), react(), mdx(),sitemap({
    filter: (page) =>
      !page.includes('/track') &&
      !page.includes('/org') &&
      !page.includes('/health') &&
      !page.includes('/dashboard') &&
      !page.includes('/settings') &&
      !page.includes('/api/')
  }),],
  output: 'static',
});
