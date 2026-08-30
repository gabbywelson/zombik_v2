/**
 * CONTENT SCHEMAS — the "rules" for every Markdown file under src/content/.
 *
 * Every Markdown file in this site starts with a block of settings between two
 * `---` lines. That block is called "frontmatter". This file defines which
 * frontmatter fields exist, which are required, and what type they must be.
 *
 * When you run `bun run build`, Astro checks every content file against these
 * rules. If a file is missing a required field (or has a typo in a field name),
 * the build stops with an error that names the file and the problem. That is a
 * feature: it catches mistakes before they reach the live site.
 *
 * The four "collections" (groups of content) are:
 *
 *   posts    -> src/content/posts/*.md    Blog posts. Listed at /posts, each at /posts/<filename>
 *   writing  -> src/content/writing/*.md  Fiction and long-form work. Listed at /writing, each at /writing/<filename>
 *   pages    -> src/content/pages/*.md    The Home, About, and Now pages (exactly one file each)
 *   site     -> src/content/site/*.md     Site-wide settings and the author profile (exactly one file each)
 *
 * To add a NEW optional field to posts (say, `subtitle`), add it here as
 * `subtitle: z.string().optional()`, then read it in the page that should show
 * it (src/pages/posts/[slug].astro). Fields that aren't declared here are
 * silently dropped, so a new field must be added here first.
 *
 * `z` is the Zod library. The pieces you'll see:
 *   z.string()            text
 *   z.string().optional() text that may be left out
 *   z.string().datetime() a full ISO date like "2026-08-01T16:00:00.000Z"
 *   z.array(...)          a list
 *   .default([])          if the field is missing, treat it as an empty list
 *   image()               a path to a picture in src/assets/images/, which Astro
 *                         will validate, resize, and optimize at build time
 */
import { defineCollection, z, type ImageFunction } from 'astro:content';
import { glob } from 'astro/loaders';

/** A tag on a post: `title` is what readers see, `slug` is the URL-safe id (lowercase, hyphens). */
const tagSchema = z.object({
  title: z.string(),
  slug: z.string(),
});

/**
 * Fields shared by blog posts and writing entries.
 * See templates/post.md for an annotated, copy-pasteable example.
 */
const entryFields = (image: ImageFunction) => ({
  /** Shown as the page heading, in lists, in the browser tab, and in the RSS feed. */
  title: z.string(),
  /** Publication date/time in ISO format. Controls sort order (newest first). */
  publishedAt: z.string().datetime(),
  /** One- or two-sentence summary shown on cards, in the RSS feed, and in search/social previews. */
  excerpt: z.string(),
  /** Optional list of tags, e.g. [{"title":"Writing","slug":"writing"}]. */
  tags: z.array(tagSchema).default([]),
  /** Optional picture shown at the top of the post and used for social-media previews. */
  heroImage: image().optional(),
  /** Text description of the picture for screen readers and when the image can't load. */
  heroImageAlt: z.string().optional(),
});

// ---- posts: blog posts ------------------------------------------------------
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: ({ image }) => z.object(entryFields(image)),
});

// ---- writing: fiction and long-form work ------------------------------------
const writing = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/writing' }),
  schema: ({ image }) => z.object(entryFields(image)),
});

// ---- pages: Home, About, Now --------------------------------------------------
// Each file declares its `type`, and the fields allowed depend on that type.
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: ({ image }) =>
    z.discriminatedUnion('type', [
      // src/content/pages/home.md — rendered by src/pages/index.astro
      z.object({
        type: z.literal('home'),
        title: z.string(),
        /** The big headline at the top of the homepage. */
        heroHeading: z.string(),
        /** The sentence under the headline. */
        heroSubheading: z.string(),
        /** Optional picture used for the homepage's social-media preview card. */
        heroImage: image().optional(),
        heroImageAlt: z.string().optional(),
        /**
         * Which posts appear in the "Featured Posts" section, by filename
         * without ".md" (e.g. "boskone-60"). Leave empty to show the three newest.
         */
        featuredPosts: z.array(z.string()).default([]),
      }),
      // src/content/pages/about.md — rendered by src/pages/about.astro
      z.object({
        type: z.literal('about'),
        title: z.string(),
      }),
      // src/content/pages/now.md — rendered by src/pages/now.astro
      z.object({
        type: z.literal('now'),
        title: z.string(),
        /** Optional date (e.g. "2026-02-02") shown as "Last updated …" under the heading. */
        lastUpdated: z.string().optional(),
      }),
    ]),
});

// ---- site: author profile and global settings --------------------------------
const site = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/site' }),
  schema: ({ image }) =>
    z.discriminatedUnion('type', [
      // src/content/site/author.md
      z.object({
        type: z.literal('author'),
        name: z.string(),
        roleLine: z.string(),
        /** Portrait shown on the About page and used as the default social preview image. */
        portrait: image().optional(),
        portraitAlt: z.string().optional(),
        /** Links listed under "Elsewhere" on the About and Contact pages. */
        socialLinks: z
          .array(z.object({ label: z.string(), url: z.string().url() }))
          .default([]),
      }),
      // src/content/site/settings.md
      z.object({
        type: z.literal('settings'),
        /** Site name: shown top-left in the header and appended to every browser-tab title. */
        siteTitle: z.string(),
        /** Default description for search engines and social previews. */
        siteDescription: z.string(),
        /** Header navigation links, in order. "Contact" is always added automatically. */
        navItems: z
          .array(z.object({ title: z.string(), href: z.string() }))
          .default([]),
        /** Optional image for social previews when a page has no image of its own. */
        defaultOgImage: image().optional(),
        defaultOgImageAlt: z.string().optional(),
      }),
    ]),
});

export const collections = { posts, writing, pages, site };
