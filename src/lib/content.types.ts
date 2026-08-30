/**
 * TYPE DEFINITIONS — descriptions of the data shapes passed between
 * src/lib/content.ts and the pages/components.
 *
 * These are TypeScript "types": they exist only to help the editor and the
 * `bun run check` command catch mistakes (like a page asking for a field that
 * doesn't exist). They produce no output of their own and never affect how the
 * site looks. You should not need to edit this file unless you add a new
 * frontmatter field in src/content.config.ts and want pages to use it.
 */
import type { CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';

export interface TagData {
  title: string;
  slug: string;
}

/** The fields a post or writing entry exposes to cards and lists. */
export interface EntryCardData {
  id: string;
  slug: string;
  publishedAt: string;
  title: string;
  excerpt: string;
  heroImage?: ImageMetadata;
  heroImageAlt?: string;
  tags: TagData[];
}

/** A full post: card fields plus the raw entry (needed to render the Markdown body). */
export interface PostPageData extends EntryCardData {
  entry: CollectionEntry<'posts'>;
}

export interface WritingPageData extends EntryCardData {
  entry: CollectionEntry<'writing'>;
}

export type PostCardData = EntryCardData;
export type WritingCardData = EntryCardData;

export interface AuthorData {
  name: string;
  roleLine: string;
  portrait?: ImageMetadata;
  portraitAlt?: string;
  socialLinks: Array<{ label: string; url: string }>;
}

export interface SiteSettingsData {
  siteTitle: string;
  siteDescription: string;
  navItems: Array<{ title: string; href: string }>;
  defaultOgImage?: ImageMetadata;
  defaultOgImageAlt?: string;
}
