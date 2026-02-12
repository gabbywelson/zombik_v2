import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import sanity from '@sanity/astro';

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID || 'replace-with-project-id';
const dataset = process.env.PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.PUBLIC_SANITY_API_VERSION || '2025-01-01';
const studioBasePath = process.env.SANITY_STUDIO_BASE_PATH || '/studio';
const isCheckCommand = process.argv.some((arg) => arg.includes('check'));
const viteCacheDir = isCheckCommand ? '.astro/vite-check' : '.astro/vite';
const siteUrl = process.env.PUBLIC_SITE_URL || 'https://chriszombik.com';

export default defineConfig({
  site: siteUrl,
  output: 'static',
  adapter: vercel(),
  security: {
    // Contact form posts can arrive via equivalent apex/www domains after redirects.
    // We enforce anti-spam in the endpoint (Turnstile + validation + honeypot), so
    // we disable Astro's strict same-origin POST check here.
    checkOrigin: false,
  },
  vite: {
    cacheDir: viteCacheDir,
  },
  integrations: [
    sanity({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      studioBasePath,
    }),
    react(),
  ],
});
