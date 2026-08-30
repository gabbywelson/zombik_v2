import { defineConfig } from 'astro/config';

const isCheckCommand = process.argv.some((arg) => arg.includes('check'));
const viteCacheDir = isCheckCommand ? '.astro/vite-check' : '.astro/vite';
const siteUrl = process.env.PUBLIC_SITE_URL || 'https://www.chriszombik.com';

export default defineConfig({
  site: siteUrl,
  output: 'static',
  vite: {
    cacheDir: viteCacheDir,
  },
});
