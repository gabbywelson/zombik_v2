import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getPostIndexData, getSiteSettingsData } from '../lib/content';

const FALLBACK_SITE_URL = 'https://chriszombik.com';

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
