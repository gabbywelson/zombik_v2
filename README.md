# chriszombik.com boilerplate

Astro + Sanity starter for a mostly static author site.

## Stack

- Astro (static output)
- Sanity Studio embedded at `/studio`
- Bun for package/runtime tooling
- Resend for contact form email delivery
- Cloudflare Turnstile for contact form CAPTCHA

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
- `bun run import:payload:dry` - dry-run Payload -> Sanity import
- `bun run import:payload` - execute Payload -> Sanity import

## Content model

Sanity schema types included:

- `post`
- `writing`
- `tag`
- `author`
- `homePage`
- `aboutPage`
- `nowPage`
- `siteSettings`

Posts support:

- title, date, tags, hero image
- rich text with indented style + links + footnotes

Writing entries support:

- title, date, tags, hero image
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

## Contact Form Setup

The site includes a contact form at `/contact` with server-side handling at `/api/contact`.

Required env vars:

- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL`
- `CONTACT_FROM_EMAIL`
- `PUBLIC_TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`

Optional:

- `CONTACT_SUBJECT_PREFIX` (defaults to `[chriszombik.com]`)

Setup steps:

1. Create a Turnstile widget for `chriszombik.com` and `localhost`.
2. Verify the sending domain/address in Resend for `CONTACT_FROM_EMAIL`.
3. Set all variables locally in `.env` and in Vercel project settings.

## Importing Existing Payload Content

This repo includes a migration script at `/Users/welson/code/zombik_v2/scripts/import-payload-to-sanity.ts` that imports content from a Payload API into Sanity.

### What it imports

- `categories` -> Sanity `tag`
- `posts` -> Sanity `post`
- `short-stories` -> Sanity `writing`
- `pages` (`home`, `about`, `now`) -> Sanity `homePage`, `aboutPage`, `nowPage`
- `globals/header` -> `siteSettings.navItems`
- `globals/footer.socialLinks` + post author names -> `author`
- payload media assets -> Sanity image assets (unless `--skip-images`)

### Setup

1. Configure env vars in `.env`:
   - `SANITY_PROJECT_ID`
   - `SANITY_DATASET`
   - `SANITY_WRITE_TOKEN` (write access token)
   - `PAYLOAD_BASE_URL` (defaults to `https://www.chriszombik.com`)
2. Run a dry run:

```bash
bun run import:payload:dry
```

This writes a preview file: `payload-import-preview.json`

3. Execute the import:

```bash
bun run import:payload
```

### Optional flags

- `--include-drafts` include non-published Payload docs
- `--skip-images` skip media upload to Sanity
- `--verbose` print progress logs
