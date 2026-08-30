# chriszombik.com

Chris Zombik's Astro site. It is a fully static site: all editorial content and media live in this repository, there is no CMS, no content API, no server code, and no third-party services beyond GitHub Pages. Every page is plain HTML, CSS, and a little JavaScript generated at build time.

## Stack

- Astro with statically generated pages
- Markdown content collections with validated frontmatter
- Repository-managed images optimized by Astro at build time
- GitHub Actions builds the site and publishes it to GitHub Pages on every push to `main`

## Local development

```bash
bun install
bun run dev
```

Open `http://localhost:4321`. No credentials or environment variables are required.

## Content layout

```text
src/content/
├── pages/       # Home, About, and Now
├── posts/       # Blog posts; filename is the public URL slug
├── site/        # Author profile, social links, navigation, and site metadata
└── writing/     # Fiction and other long-form writing

src/assets/images/  # Local editorial images
```

Schemas are defined in `src/content.config.ts`. A build fails when required frontmatter is missing or malformed, which makes content errors visible before deployment.

## Managing content with Codex or Claude Code

You can ask a coding assistant to create or edit content in plain language. For example:

> Create a draft post titled "Working title" dated August 1, 2026. Use `notes/draft.md` as source material, add the attached image with descriptive alt text, and show me the local result without committing.

For a new post, add `src/content/posts/<slug>.md`:

```markdown
---
title: "Post title"
publishedAt: "2026-08-01T16:00:00.000Z"
excerpt: "A short summary used on cards, in RSS, and for search previews."
tags: [{"title":"Writing","slug":"writing"}]
heroImage: "../../assets/images/descriptive-filename.jpg"
heroImageAlt: "A concise description of the image"
---

The post body is ordinary Markdown.
```

The filename controls the URL: the example above at `src/content/posts/example.md` is published at `/posts/example`.

- Put images in `src/assets/images/` and reference them with the relative path shown above.
- Use normal Markdown for headings, links, emphasis, lists, blockquotes, code, and footnotes.
- Feature a post on the homepage by adding its filename/slug to `featuredPosts` in `src/content/pages/home.md`.
- Edit navigation and global metadata in `src/content/site/settings.md`.
- Edit the portrait and social links (used on the About and Contact pages) in `src/content/site/author.md`. The footer links are in `src/components/Footer.astro`.
- Edit the homepage, About page, or Now page in `src/content/pages/`.

## Contact page

There is no contact form. `/contact` shows an email address plus the social links from `src/content/site/author.md`.

To keep the address away from spam scrapers, it is never written in plain text in this repository or in the page's HTML. It is stored in an encoded form in `src/lib/contact-email.ts` and decoded in the visitor's browser; visitors without JavaScript see a spelled-out hint instead.

To change the address:

```bash
bun run contact-email someone@example.com
```

Paste the printed `CONTACT_EMAIL` value into `src/lib/contact-email.ts`, and update the spelled-out hint in `src/pages/contact.astro` if it no longer matches.

## Verification

Run these before committing:

```bash
bun run check   # type-checks Astro components
bun test        # unit tests
bun run build   # produces the static site in dist/
bun run preview # serves dist/ locally
```

## Deployment

The site is published by GitHub Pages from the `.github/workflows/deploy.yml` workflow. Pushing to `main` builds the site and deploys it; nothing else is required.

One-time repository setup (already done, recorded here for reference):

1. In the repository's **Settings → Pages**, set **Source** to **GitHub Actions**.
2. `public/CNAME` contains the custom domain (`www.chriszombik.com`). GitHub reads it from the build output and configures the custom domain automatically.
3. Point DNS at GitHub Pages. At the DNS provider for `chriszombik.com`:
   - `www` → `CNAME` record to `gabbywelson.github.io` (or `<owner>.github.io` for whoever owns the repository)
   - apex (`chriszombik.com`) → `A` records to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (GitHub redirects the apex to `www`)
   - Then, in **Settings → Pages**, verify the custom domain and enable **Enforce HTTPS**.

`PUBLIC_SITE_URL` is the only environment variable and is optional; it overrides the canonical origin (default `https://www.chriszombik.com`) used for absolute URLs in RSS and social metadata.
