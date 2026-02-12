import type { PortableTextBlock } from '@portabletext/types';

export type { PortableTextBlock };

export interface SanityImageSource {
  _type?: 'image';
  asset?: {
    _ref: string;
    _type?: 'reference';
  };
  alt?: string;
}

export interface TagData {
  _id?: string;
  title: string;
  slug: string;
}

interface BaseEntryCardData {
  _id: string;
  title: string;
  slug: string;
  publishedAt: string;
  excerpt: string;
  heroImage?: SanityImageSource;
  tags: TagData[];
}

export interface PostCardData extends BaseEntryCardData {}

export interface PostPageData extends PostCardData {
  body: PortableTextBlock[];
}

export interface WritingCardData extends BaseEntryCardData {}

export interface WritingPageData extends WritingCardData {
  body: PortableTextBlock[];
}

export interface HomePageData {
  heroHeading: string;
  heroSubheading: string;
  intro: PortableTextBlock[];
  featuredPosts: PostCardData[];
}

export interface AboutPageData {
  title: string;
  body: PortableTextBlock[];
}

export interface NowPageData {
  title: string;
  lastUpdated?: string;
  body: PortableTextBlock[];
}

export interface AuthorData {
  name: string;
  roleLine: string;
  bio: string;
  portrait?: SanityImageSource;
  socialLinks?: Array<{
    label: string;
    url: string;
  }>;
}

export interface SiteSettingsData {
  siteTitle: string;
  siteDescription: string;
  navItems?: Array<{
    title: string;
    href: string;
  }>;
}

export interface FootnoteMarkDefinition {
  _key: string;
  _type: 'footnote';
  note: PortableTextBlock[];
}

export interface FootnoteItem {
  key: string;
  number: number;
  refId: string;
  noteId: string;
  note: PortableTextBlock[];
}
