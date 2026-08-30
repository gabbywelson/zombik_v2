/**
 * CONTENT LOADERS — small helper functions that read the Markdown files under
 * src/content/ and hand the results to the pages in src/pages/.
 *
 * You should rarely need to touch this file. Pages call these functions instead
 * of reading files themselves, so every page sees the same data in the same
 * shape (sorted newest-first, with the URL "slug" filled in, and so on).
 *
 * The "slug" of a post or writing entry is simply its filename without ".md":
 *   src/content/posts/boskone-60.md  ->  slug "boskone-60"  ->  URL /posts/boskone-60
 */
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import type {
  AuthorData,
  EntryCardData,
  PostPageData,
  SiteSettingsData,
  WritingPageData,
} from './content.types';

/** Convert a raw content entry into the flat shape that cards and lists use. */
function toCardData(
  entry: CollectionEntry<'posts'> | CollectionEntry<'writing'>,
): EntryCardData {
  return {
    id: entry.id,
    slug: entry.id,
    title: entry.data.title,
    publishedAt: entry.data.publishedAt,
    excerpt: entry.data.excerpt,
    heroImage: entry.data.heroImage,
    heroImageAlt: entry.data.heroImageAlt,
    tags: entry.data.tags,
  };
}

/** Sort helper: most recently published first. */
function newestFirst(a: EntryCardData, b: EntryCardData): number {
  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
}

/** All blog posts, newest first. Used by the homepage, /posts, and the RSS feed. */
export async function getPostIndexData(): Promise<EntryCardData[]> {
  return (await getCollection('posts')).map(toCardData).sort(newestFirst);
}

/** All writing entries, newest first. Used by the homepage and /writing. */
export async function getWritingIndexData(): Promise<EntryCardData[]> {
  return (await getCollection('writing')).map(toCardData).sort(newestFirst);
}

/** Every post slug — tells Astro which /posts/<slug> pages to generate. */
export async function getPostSlugs(): Promise<string[]> {
  return (await getCollection('posts')).map((entry: CollectionEntry<'posts'>) => entry.id);
}

/** Every writing slug — tells Astro which /writing/<slug> pages to generate. */
export async function getWritingSlugs(): Promise<string[]> {
  return (await getCollection('writing')).map((entry: CollectionEntry<'writing'>) => entry.id);
}

/** One post plus its full Markdown body, or null if no file has that slug. */
export async function getPostBySlug(slug: string): Promise<PostPageData | null> {
  const entry = await getEntry('posts', slug);
  return entry ? { ...toCardData(entry), entry } : null;
}

/** One writing entry plus its full Markdown body, or null if no file has that slug. */
export async function getWritingBySlug(slug: string): Promise<WritingPageData | null> {
  const entry = await getEntry('writing', slug);
  return entry ? { ...toCardData(entry), entry } : null;
}

/** The Home, About, or Now page content (src/content/pages/<id>.md). */
export async function getPageEntry(id: 'home' | 'about' | 'now') {
  const entry = await getEntry('pages', id);
  if (!entry) throw new Error(`Missing required page content: ${id}`);
  return entry;
}

/**
 * Homepage settings, with `featuredPosts` turned from a list of slugs into the
 * actual posts. A slug that doesn't match any post is quietly skipped.
 */
export async function getHomePageData() {
  const [entry, posts] = await Promise.all([getPageEntry('home'), getPostIndexData()]);
  if (entry.data.type !== 'home') throw new Error('Home content has the wrong page type.');

  const postsBySlug = new Map(posts.map((post) => [post.slug, post]));
  return {
    ...entry.data,
    featuredPosts: entry.data.featuredPosts
      .map((slug: string) => postsBySlug.get(slug))
      .filter((post: EntryCardData | undefined): post is EntryCardData => Boolean(post)),
  };
}

/** The author profile from src/content/site/author.md. */
export async function getAuthorData(): Promise<AuthorData> {
  const entry = await getEntry('site', 'author');
  if (!entry || entry.data.type !== 'author') throw new Error('Missing author content.');
  return entry.data;
}

/** Site-wide settings from src/content/site/settings.md. */
export async function getSiteSettingsData(): Promise<SiteSettingsData> {
  const entry = await getEntry('site', 'settings');
  if (!entry || entry.data.type !== 'settings') throw new Error('Missing site settings content.');
  return entry.data;
}
