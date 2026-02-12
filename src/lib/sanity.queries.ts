export const homePageQuery = /* groq */ `
  *[_type == "homePage"][0] {
    heroHeading,
    heroSubheading,
    intro,
    novelCardCopy,
    memoirCardCopy,
    featuredPosts[]->{
      _id,
      title,
      "slug": slug.current,
      publishedAt,
      excerpt,
      heroImage,
      "tags": coalesce(tags[]->{
        _id,
        title,
        "slug": slug.current
      }, [])
    }
  }
`;

export const aboutPageQuery = /* groq */ `
  *[_type == "aboutPage"][0] {
    title,
    body
  }
`;

export const nowPageQuery = /* groq */ `
  *[_type == "nowPage"][0] {
    title,
    lastUpdated,
    body
  }
`;

export const authorQuery = /* groq */ `
  *[_type == "author"][0] {
    name,
    roleLine,
    bio,
    portrait,
    socialLinks[]{label, url}
  }
`;

export const siteSettingsQuery = /* groq */ `
  *[_type == "siteSettings"][0] {
    siteTitle,
    siteDescription,
    navItems[] {
      title,
      href
    }
  }
`;

export const postIndexQuery = /* groq */ `
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    excerpt,
    heroImage,
    "tags": coalesce(tags[]->{
      _id,
      title,
      "slug": slug.current
    }, [])
  }
`;

export const postSlugsQuery = /* groq */ `
  *[_type == "post" && defined(slug.current)].slug.current
`;

export const postBySlugQuery = /* groq */ `
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    excerpt,
    heroImage,
    body,
    "tags": coalesce(tags[]->{
      _id,
      title,
      "slug": slug.current
    }, [])
  }
`;

export const writingIndexQuery = /* groq */ `
  *[_type == "writing" && defined(slug.current)] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    excerpt,
    heroImage,
    "tags": coalesce(tags[]->{
      _id,
      title,
      "slug": slug.current
    }, [])
  }
`;

export const writingSlugsQuery = /* groq */ `
  *[_type == "writing" && defined(slug.current)].slug.current
`;

export const writingBySlugQuery = /* groq */ `
  *[_type == "writing" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    excerpt,
    heroImage,
    body,
    "tags": coalesce(tags[]->{
      _id,
      title,
      "slug": slug.current
    }, [])
  }
`;
