---
name: edit-site-settings
description: Change site-wide settings on chriszombik.com — the site title/description, header navigation links, social links (Twitter/X, Bluesky, LinkedIn), the footer, or the contact email address. Use when asked to change any of those.
---

# Edit site-wide settings

## Site title and description — `src/content/site/settings.md`

- `siteTitle` — shown top-left in the header and appended to every browser-tab title.
- `siteDescription` — default description for search engines and social previews.

## Header navigation — `src/content/site/settings.md`

`navItems` is an ordered list of `{"title": "...", "href": "..."}`. Only link to pages that exist
(`/`, `/about`, `/posts`, `/writing`, `/now`, `/contact`). "Contact" is appended automatically if it is
not in the list (see `src/components/Header.astro`). The theme toggle button is always last.

## Social links

There are **two** places, and they should match:

1. `socialLinks` in `src/content/site/author.md` — used by the About and Contact pages' "Elsewhere" lists.
   Each item needs `label` and a full `url` (`https://…`); the build fails on an invalid URL.
2. `src/components/Footer.astro` — the footer links are written directly in the HTML there.

Current links: Twitter/X `https://x.com/chriszombik`, Bluesky `https://bsky.app/profile/chriszombik.com`,
LinkedIn `https://www.linkedin.com/in/christopher-zombik-5b085324/`.

## Footer text — `src/components/Footer.astro`

Copyright line (year is automatic), social links, and the design credit.

## Contact email address — `src/lib/contact-email.ts`

The address is stored **encoded** so it never appears in plain text in this public repository or in
the page HTML (which keeps spam scrapers away). To change it:

```bash
bun run contact-email new.address@example.com
```

Paste the printed `CONTACT_EMAIL` block over the existing one in `src/lib/contact-email.ts`.
Then update the spelled-out no-JavaScript hint in `src/pages/contact.astro` (currently "the first
letter of his first name, followed by his last name, at gmail dot com") so it still describes the new
address. Never write the plain address into any file. Run `bun test` — a test checks the encoded value
decodes to something email-shaped.

## Domain / site URL

If the site ever moves to a different domain: change `site` in `astro.config.mjs`, `public/CNAME`,
and the custom domain in the GitHub repository's **Settings → Pages**. See README "Deployment".

## After editing

`bun run build` — schema errors (bad URL, missing field) show up here with the file name.
