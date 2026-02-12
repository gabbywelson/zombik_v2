import {
  aboutPageQuery,
  authorQuery,
  homePageQuery,
  nowPageQuery,
  postIndexQuery,
  postBySlugQuery,
  postSlugsQuery,
  siteSettingsQuery,
  writingBySlugQuery,
  writingIndexQuery,
  writingSlugsQuery,
} from './sanity.queries';
import {
  fallbackAboutPage,
  fallbackAuthor,
  fallbackHomePage,
  fallbackNowPage,
  fallbackPosts,
  fallbackSiteSettings,
  fallbackWriting,
} from './fallbackContent';
import { isSanityConfigured, sanityClient } from './sanity.client';
import type {
  AboutPageData,
  AuthorData,
  HomePageData,
  NowPageData,
  PostCardData,
  PostPageData,
  SiteSettingsData,
  TagData,
  WritingCardData,
  WritingPageData,
} from './sanity.types';

async function fetchWithFallback<T>(query: string, fallback: T, params?: Record<string, unknown>) {
  if (!isSanityConfigured) {
    return fallback;
  }

  try {
    const result = await sanityClient.fetch<T>(query, params ?? {});
    return result ?? fallback;
  } catch (error) {
    console.warn('Falling back to local content because Sanity fetch failed.', error);
    return fallback;
  }
}

function normalizeTags(rawTags: unknown): TagData[] {
  if (!Array.isArray(rawTags)) {
    return [];
  }

  return rawTags
    .filter((tag): tag is { title?: unknown; slug?: unknown; _id?: unknown } => {
      return Boolean(tag && typeof tag === 'object');
    })
    .map((tag) => ({
      _id: typeof tag._id === 'string' ? tag._id : undefined,
      title: typeof tag.title === 'string' ? tag.title : '',
      slug: typeof tag.slug === 'string' ? tag.slug : '',
    }))
    .filter((tag) => tag.title.length > 0 && tag.slug.length > 0);
}

function normalizePostCard(post: PostCardData): PostCardData {
  return {
    ...post,
    tags: normalizeTags((post as PostCardData & { tags?: unknown }).tags),
  };
}

function normalizeWritingCard(writing: WritingCardData): WritingCardData {
  return {
    ...writing,
    tags: normalizeTags((writing as WritingCardData & { tags?: unknown }).tags),
  };
}

export async function getHomePageData(): Promise<HomePageData> {
  const page = await fetchWithFallback(homePageQuery, fallbackHomePage);
  const novelCardCopy =
    typeof page.novelCardCopy === 'string' && page.novelCardCopy.trim().length > 0
      ? page.novelCardCopy
      : fallbackHomePage.novelCardCopy;
  const memoirCardCopy =
    typeof page.memoirCardCopy === 'string' && page.memoirCardCopy.trim().length > 0
      ? page.memoirCardCopy
      : fallbackHomePage.memoirCardCopy;

  return {
    ...page,
    novelCardCopy,
    memoirCardCopy,
    featuredPosts: Array.isArray(page.featuredPosts)
      ? page.featuredPosts.map(normalizePostCard)
      : [],
  };
}

export async function getAboutPageData(): Promise<AboutPageData> {
  return fetchWithFallback(aboutPageQuery, fallbackAboutPage);
}

export async function getNowPageData(): Promise<NowPageData> {
  return fetchWithFallback(nowPageQuery, fallbackNowPage);
}

export async function getAuthorData(): Promise<AuthorData> {
  return fetchWithFallback(authorQuery, fallbackAuthor);
}

export async function getSiteSettingsData(): Promise<SiteSettingsData> {
  return fetchWithFallback(siteSettingsQuery, fallbackSiteSettings);
}

export async function getPostIndexData(): Promise<PostCardData[]> {
  const posts = await fetchWithFallback(
    postIndexQuery,
    fallbackPosts.map((post) => ({
      _id: post._id,
      title: post.title,
      slug: post.slug,
      publishedAt: post.publishedAt,
      excerpt: post.excerpt,
      heroImage: post.heroImage,
      tags: post.tags,
    })),
  );

  return Array.isArray(posts) ? posts.map(normalizePostCard) : [];
}

export async function getWritingIndexData(): Promise<WritingCardData[]> {
  const writing = await fetchWithFallback(
    writingIndexQuery,
    fallbackWriting.map((entry) => ({
      _id: entry._id,
      title: entry.title,
      slug: entry.slug,
      publishedAt: entry.publishedAt,
      excerpt: entry.excerpt,
      heroImage: entry.heroImage,
      tags: entry.tags,
    })),
  );

  return Array.isArray(writing) ? writing.map(normalizeWritingCard) : [];
}

export async function getPostSlugs(): Promise<string[]> {
  return fetchWithFallback(
    postSlugsQuery,
    fallbackPosts.map((post) => post.slug),
  );
}

export async function getPostBySlug(slug: string): Promise<PostPageData | null> {
  const fallback = fallbackPosts.find((post) => post.slug === slug) ?? null;
  const post = await fetchWithFallback(postBySlugQuery, fallback, { slug });

  if (!post) {
    return null;
  }

  return {
    ...post,
    tags: normalizeTags((post as PostPageData & { tags?: unknown }).tags),
    body: Array.isArray(post.body) ? post.body : [],
  };
}

export async function getWritingSlugs(): Promise<string[]> {
  return fetchWithFallback(
    writingSlugsQuery,
    fallbackWriting.map((entry) => entry.slug),
  );
}

export async function getWritingBySlug(slug: string): Promise<WritingPageData | null> {
  const fallback = fallbackWriting.find((entry) => entry.slug === slug) ?? null;
  const entry = await fetchWithFallback(writingBySlugQuery, fallback, { slug });

  if (!entry) {
    return null;
  }

  return {
    ...entry,
    tags: normalizeTags((entry as WritingPageData & { tags?: unknown }).tags),
    body: Array.isArray(entry.body) ? entry.body : [],
  };
}
