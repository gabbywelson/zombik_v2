# chriszombik.com boilerplate

Astro + Sanity starter for a mostly static author site.

## Stack

- Astro (static output)
- Sanity Studio embedded at `/studio`
- Bun for package/runtime tooling

## Quick start

1. Install dependencies:

```bash
bun install
```

2. Copy env vars:

```bash
cp .env.example .env
```

3. Set your Sanity project values in `.env`:

- `PUBLIC_SANITY_PROJECT_ID`
- `PUBLIC_SANITY_DATASET`
- `PUBLIC_SANITY_API_VERSION`
- `SANITY_STUDIO_BASE_PATH` (default `/studio`)

4. Start the dev server:

```bash
bun run dev
```

Site: `http://localhost:4321`  
Studio: `http://localhost:4321/studio`

## Scripts

- `bun run dev` - start local dev server
- `bun run build` - production build
- `bun run preview` - preview built site
- `bun run check` - Astro type/content checks
- `bun run test` - unit tests (Bun)

## Content model

Sanity schema types included:

- `post`
- `tag`
- `author`
- `homePage`
- `aboutPage`
- `siteSettings`

Posts support:

- title, date, tags, hero image
- content kind (`blog`, `short-story`, `essay`)
- rich text with indented style + links + footnotes

Portable Text editor behavior includes:

- markdown shortcuts
- typography rules (smart quotes, em dash, ellipsis)

## Deployment (Vercel)

Use:

- Install command: `bun install`
- Build command: `bun run build`

Set the same environment variables in Vercel project settings.

To refresh static content on publish/unpublish, configure a Sanity webhook that triggers a Vercel deploy hook.
