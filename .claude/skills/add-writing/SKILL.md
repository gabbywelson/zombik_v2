---
name: add-writing
description: Add a piece of fiction or long-form writing to the /writing section of chriszombik.com (a Markdown file in src/content/writing/). Use when asked to add a story, novella excerpt, essay, or other non-blog writing.
---

# Add a writing entry

Writing entries work exactly like blog posts (same frontmatter, same Markdown) but live in
`src/content/writing/` and appear at `/writing/<slug>` and on the `/writing` list. They are **not**
included in the RSS feed, and the `/writing` list does not show hero images.

Follow the `add-blog-post` skill with these differences:

- Start from `templates/writing.md`, not `templates/post.md`.
- File path: `src/content/writing/<slug>.md`.
- Preview URL: `http://localhost:4321/writing/<slug>`.
- For fiction, a good `excerpt` is the first sentence or two of the piece.
- A `heroImage` is optional and only used for the social-preview card when the link is shared.
- Scene breaks: three asterisks (`***`) on their own line render as a horizontal rule.
- The homepage's "Latest Writing" section automatically shows the two newest entries; nothing to configure.
