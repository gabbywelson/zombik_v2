import {
  aboutPageQuery,
  authorQuery,
  homePageQuery,
  postBySlugQuery,
  postSlugsQuery,
  siteSettingsQuery,
  writingIndexQuery,
} from './sanity.queries';
import {
  fallbackAboutPage,
  fallbackAuthor,
  fallbackHomePage,
  fallbackPosts,
  fallbackSiteSettings,
} from './fallbackContent';
import { isSanityConfigured, sanityClient } from './sanity.client';
import type {
  AboutPageData,
  AuthorData,
  HomePageData,
  PostCardData,
  PostPageData,
  SiteSettingsData,
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

export async function getHomePageData(): Promise<HomePageData> {
  return fetchWithFallback(homePageQuery, fallbackHomePage);
}

export async function getAboutPageData(): Promise<AboutPageData> {
  return fetchWithFallback(aboutPageQuery, fallbackAboutPage);
}

export async function getAuthorData(): Promise<AuthorData> {
  return fetchWithFallback(authorQuery, fallbackAuthor);
}

export async function getSiteSettingsData(): Promise<SiteSettingsData> {
  return fetchWithFallback(siteSettingsQuery, fallbackSiteSettings);
}

export async function getWritingIndexData(): Promise<PostCardData[]> {
  return fetchWithFallback(
    writingIndexQuery,
    fallbackPosts.map((post) => ({
      _id: post._id,
      title: post.title,
      slug: post.slug,
      publishedAt: post.publishedAt,
      excerpt: post.excerpt,
      contentKind: post.contentKind,
      heroImage: post.heroImage,
      tags: post.tags,
    })),
  );
}

export async function getPostSlugs(): Promise<string[]> {
  return fetchWithFallback(
    postSlugsQuery,
    fallbackPosts.map((post) => post.slug),
  );
}

export async function getPostBySlug(slug: string): Promise<PostPageData | null> {
  const fallback = fallbackPosts.find((post) => post.slug === slug) ?? null;
  return fetchWithFallback(postBySlugQuery, fallback, { slug });
}
