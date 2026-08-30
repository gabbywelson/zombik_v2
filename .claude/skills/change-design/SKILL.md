---
name: change-design
description: Change how chriszombik.com looks — colors, fonts, spacing, dark mode, layout of cards or pages. Use when asked to restyle, retheme, tweak the design, or adjust responsive/mobile layout.
---

# Change the design

All styling is in **one file: `src/styles/global.css`**. It starts with a map of its sections. Page
structure (which HTML elements exist) is in `src/pages/*.astro` and `src/components/*.astro`.

## Colors

Defined once as CSS variables at the top of `global.css`:

- `:root { … }` — the light theme
- `html[data-theme='dark'] { … }` — the dark theme

Every color used elsewhere refers to these (`var(--accent)`, `var(--paper)`, …). To change a color,
change the variable in **both** blocks so light and dark stay coherent. Do not add hard-coded colors to
individual rules; add a new variable instead.

## Fonts

Loaded from Google Fonts by the `<link>` in `src/layouts/BaseLayout.astro`; assigned to
`--font-display`, `--font-body`, `--font-ui` in `global.css`. To swap a font: change the Google Fonts
URL (keep only the weights actually used to keep pages fast) and the matching variable.

## Layout of a page

Find the page's `.astro` file, note the `class` names on its elements, then search `global.css` for those
names. Section comments in the CSS mirror the page names ("Home", "Post lists", "Article pages", …).

## Dark/light mode

The theme toggle and its memory live in `src/components/Header.astro` (the `<script>` at the bottom)
and the flash-free bootstrap script in `src/layouts/BaseLayout.astro`. Both use the `cz-theme` key in
the browser's localStorage. The CSS switches on `html[data-theme='dark']`.

## Mobile

Narrow-screen adjustments are in the `@media (max-width: 680px)` block at the end of `global.css`.

## Checking your work

1. `bun run dev` and view the page at `http://localhost:4321` — resize the window to check mobile.
2. Toggle the theme button in the header to check **both** light and dark.
3. `bun run build` before publishing.

Keep changes minimal and in keeping with the existing look (warm paper tones, serif body text,
monospace labels) unless the user explicitly wants a redesign.
