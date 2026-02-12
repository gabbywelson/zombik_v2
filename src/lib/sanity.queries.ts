export const homePageQuery = /* groq */ `
  *[_type == "homePage"][0] {
    heroHeading,
    heroSubheading,
    intro,
    featuredPosts[]->{
      _id,
      title,
      "slug": slug.current,
      publishedAt,
      excerpt,
      contentKind,
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

export const writingIndexQuery = /* groq */ `
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    excerpt,
    contentKind,
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
    contentKind,
    heroImage,
    body,
    "tags": coalesce(tags[]->{
      _id,
      title,
      "slug": slug.current
    }, [])
  }
`;
