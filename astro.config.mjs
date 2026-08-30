/**
 * ASTRO CONFIGURATION.
 *
 * Astro is the "static site generator": it reads src/ and writes a folder of
 * plain HTML/CSS/JS files (dist/) that GitHub Pages serves. There is no server.
 *
 *   site    The public address of the site. Used to build absolute links in the
 *           RSS feed and social-preview tags. Change it if the domain changes.
 *   output  'static' means every page is generated ahead of time.
 */
import { defineConfig } from 'astro/config';

// `astro check` and `astro build` get separate caches so they don't trip over each other.
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
