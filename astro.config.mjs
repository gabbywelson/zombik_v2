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

export default defineConfig({
  output: 'static',
  adapter: vercel(),
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
