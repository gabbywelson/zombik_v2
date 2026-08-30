/**
 * THE RSS FEED (/rss.xml).
 *
 * Feed readers subscribe to this URL to be told when a new post is published.
 * It lists every blog post (not writing entries), newest first, with the
 * excerpt as the description. It is generated at build time like every other
 * page, so nothing here needs to run on a server.
 */
import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getPostIndexData, getSiteSettingsData } from '../lib/content';

// Only used if the `site` setting in astro.config.mjs is somehow missing.
const FALLBACK_SITE_URL = 'https://www.chriszombik.com';

export const GET: APIRoute = async (context) => {
  const [posts, siteSettings] = await Promise.all([
    getPostIndexData(),
    getSiteSettingsData(),
  ]);

  const rssItems = posts
    .map((post) => {
      const pubDate = new Date(post.publishedAt);
      if (Number.isNaN(pubDate.getTime())) {
        return null;
      }

      return {
        title: post.title,
        pubDate,
        description: post.excerpt,
        link: `/posts/${post.slug}`,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return rss({
    title: `${siteSettings.siteTitle} Posts`,
    description: 'Latest blog posts and notes by Chris Zombik.',
    site: context.site?.toString() ?? FALLBACK_SITE_URL,
    items: rssItems,
    customData: '<language>en-us</language>',
  });
};
