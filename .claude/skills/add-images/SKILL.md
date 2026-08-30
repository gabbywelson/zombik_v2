---
name: add-images
description: Add or replace an image on chriszombik.com — a post hero image, a picture inside a post body, the About-page portrait, or the homepage preview image. Use when the user provides or mentions a photo, picture, screenshot, or image.
---

# Add images

All images live in **`src/assets/images/`**. Astro validates them at build time and generates resized,
optimized copies automatically (WebP, several widths), so there is no need to resize or compress by hand.

## Steps

1. **Get the file into `src/assets/images/`.** If the user attached or pointed at a file, copy it there.
   Rename it to something descriptive, lowercase, with hyphens: `boskone-60.jpg`, not `IMG_4821.JPG`.
   Supported: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.svg`, `.avif`.

2. **Sanity-check the file.** `file src/assets/images/<name>` should report an image. Very large files
   (over ~5 MB) slow the build; if the user's photo is huge, ask before resizing with `sips`
   (macOS, e.g. `sips -Z 2400 file.jpg` to cap the longest side at 2400px).

3. **Reference it** — always with the `../../assets/images/` prefix, from anywhere in `src/content/`:

   - **Post or writing hero image** (top of the page + social preview), in the frontmatter:
     ```yaml
     heroImage: "../../assets/images/<name>.jpg"
     heroImageAlt: "Plain-language description of the picture"
     ```
   - **Inside a post body**, in Markdown:
     ```markdown
     ![Plain-language description](../../assets/images/<name>.jpg)
     ```
   - **About-page portrait**: `portrait` / `portraitAlt` in `src/content/site/author.md`.
   - **Homepage social preview**: `heroImage` / `heroImageAlt` in `src/content/pages/home.md`.

4. **Always write alt text.** Describe what is in the picture in one sentence; it is read aloud by
   screen readers and shown if the image fails to load. Do not start with "Image of".

5. **Verify:** `bun run build`. A wrong path fails with `Could not find requested image` naming the file.

## Removing an image

Delete the reference first (frontmatter or Markdown), then delete the file from `src/assets/images/`
only if nothing else uses it: `rg -n "<name>" src/content` should return nothing.

## Things that do not work

- Linking to an image on another website (hot-linking) inside `heroImage` — the field must be a local file.
  (Plain Markdown `![](https://…)` links in the body do work but are fragile; prefer copying the file in.)
- Putting images in `public/` — that folder is served as-is without optimization and is only for the
  favicon and `CNAME`.
