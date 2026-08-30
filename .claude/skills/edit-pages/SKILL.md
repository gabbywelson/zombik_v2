---
name: edit-pages
description: Edit the words on the Home, About, Now, or Contact pages of chriszombik.com. Use when asked to update the bio, the "now" page, the homepage headline/subheading, which posts are featured, or the contact page text.
---

# Edit the fixed pages

These pages are not posts; each has one source file. Change the **content file** for wording, and only
touch the `.astro` file if the *layout* needs to change.

| Page | URL | Words live in | Layout lives in |
|------|-----|---------------|-----------------|
| Home | `/` | `src/content/pages/home.md` | `src/pages/index.astro` |
| About | `/about` | `src/content/pages/about.md` (bio) + `src/content/site/author.md` (portrait, links) | `src/pages/about.astro` |
| Now | `/now` | `src/content/pages/now.md` | `src/pages/now.astro` |
| Contact | `/contact` | `src/pages/contact.astro` (short intro text) + `src/content/site/author.md` (links) + `src/lib/contact-email.ts` (email, encoded) | `src/pages/contact.astro` |

## Home (`src/content/pages/home.md`)

- `heroHeading` — the big headline. `heroSubheading` — the sentence under it.
- `featuredPosts` — list of post slugs (filenames without `.md`) to show under "Featured Posts", in order.
  Empty list = the three newest posts. Slugs that match no file are silently ignored, so double-check
  spelling against `ls src/content/posts/`.
- `heroImage` / `heroImageAlt` — only used for the social-preview card, not shown on the page.
- The Markdown body under the frontmatter is currently **not displayed** anywhere; editing it has no effect.

## About (`src/content/pages/about.md`)

The body is the bio, in Markdown. Links are fine. The portrait and the "Elsewhere" links come from
`src/content/site/author.md` (see the `edit-site-settings` skill).

## Now (`src/content/pages/now.md`)

- Update `lastUpdated` (format `"YYYY-MM-DD"`) whenever the page changes; it is shown under the heading.
- The body is Markdown; `###` headings make the sections.

## Contact (`src/pages/contact.astro`)

The one or two sentences of intro text are written directly in this file inside the `<header>`.
The email address is *not* here — see the `edit-site-settings` skill for changing it.
The no-JavaScript fallback sentence ("the first letter of his first name…") is also in this file and
must be kept in sync if the address changes.

## After editing

`bun run dev` and check the page in the browser, then `bun run build` to confirm nothing broke.
