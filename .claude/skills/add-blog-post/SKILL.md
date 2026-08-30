---
name: add-blog-post
description: Create a new blog post for chriszombik.com (a Markdown file in src/content/posts/) with correct frontmatter, optional hero image and tags, then preview it locally. Use when asked to add, draft, write, or publish a post.
---

# Add a blog post

A post is one Markdown file in `src/content/posts/`. The filename becomes the URL.

## Steps

1. **Choose the slug.** Lowercase letters, numbers, and hyphens only. Derive it from the title
   (e.g. "Notes on the Elden Ring DLC" → `notes-on-the-elden-ring-dlc`). The file is
   `src/content/posts/<slug>.md` and the page will be `/posts/<slug>`.
   Check the slug is not already taken: `ls src/content/posts/`.

2. **Create the file** from `templates/post.md`. Required frontmatter fields:
   - `title` — in double quotes. Escape inner double quotes as `\"`.
   - `publishedAt` — ISO date-time with a `Z`, e.g. `"2026-08-01T16:00:00.000Z"`. If the user gives only a
     date, use noon Eastern (16:00Z in summer, 17:00Z in winter). Posts sort by this, newest first.
   - `excerpt` — one or two sentences; used in RSS, social previews, and search results. Write one if the
     user did not supply it; keep it under ~300 characters.
   - `tags` — `[]` unless asked. Format: `[{"title":"Writing","slug":"writing"}]`. Reuse existing slugs
     (`rg -o '"slug":"[^"]+"' src/content/posts | sort | uniq -c`) so tags group together.
   - `heroImage` / `heroImageAlt` — optional. Only add them if the image file exists in
     `src/assets/images/`. See the `add-images` skill.

3. **Write the body** below the closing `---` in plain Markdown. If the user supplied source text
   (a file, a paste, a Google Doc export), preserve their wording; do not rewrite their prose unless
   asked. Convert Word/Google-Docs quirks (smart quotes are fine; remove stray formatting).

4. **Preview.** Run `bun run dev` (if it is not already running) and open
   `http://localhost:4321/posts/<slug>`. Also glance at `http://localhost:4321/posts` to see the card.

5. **Verify the build passes:** `bun run build`. A frontmatter mistake fails here with a message naming the
   file and field — fix it and rebuild.

6. **Feature it on the homepage (optional).** Add the slug to `featuredPosts` in
   `src/content/pages/home.md`. That list overrides the default "three newest posts".

7. Tell the user what you created and offer to publish (see the `publish-changes` skill). Do not commit
   or push unless asked.

## Drafts

There is no draft flag: every file in `src/content/posts/` is published on the next deploy. To keep a
draft out of the live site, keep it somewhere outside `src/content/` (for example `drafts/` at the
repository root, which is fine to commit) and move it in when it is ready. Do **not** rely on an
underscore prefix (`_draft.md`) — Astro currently still publishes those.

## Gotchas

- YAML frontmatter is picky: keep every value in double quotes; a colon inside an unquoted value breaks it.
- The `publishedAt` value must include the time and the `Z`, or the build fails ("Invalid datetime").
- Renaming a file changes its URL and breaks existing links to it. Ask before renaming a published post.
