---
# ---------------------------------------------------------------------------
# BLOG POST TEMPLATE
#
# To publish a new post:
#   1. Copy this file to src/content/posts/<slug>.md, where <slug> is the URL
#      you want: lowercase letters, numbers, and hyphens only. For example
#      src/content/posts/my-first-post.md becomes /posts/my-first-post.
#   2. Fill in the fields below and delete these instructions (lines that
#      start with # are comments; the site ignores them, but tidy is nicer).
#   3. Write the post in Markdown below the closing --- line.
#   4. Run `bun run dev` and open http://localhost:4321/posts/<slug> to check it.
#
# Every field except tags, heroImage, and heroImageAlt is required.
# ---------------------------------------------------------------------------

# The headline. Keep the quotes; if the title itself contains a double quote,
# write it as \" (see existing posts for examples).
title: "Post title"

# When it was published, in ISO format: YYYY-MM-DDTHH:MM:SS.000Z (the Z means
# UTC). Posts are sorted by this, newest first. Future dates still publish.
publishedAt: "2026-08-01T16:00:00.000Z"

# One or two sentences. Shown in the RSS feed, in social-media previews, and
# in search results.
excerpt: "A short summary of the post."

# Optional. Each tag needs a display title and a URL-safe slug. Use the same
# slug for the same tag across posts so they group together on /posts.
# Leave as [] for no tags.
tags: []
# tags: [{"title":"Writing","slug":"writing"},{"title":"AI","slug":"ai"}]

# Optional. Put the picture in src/assets/images/ first, then remove the
# leading "# " from both lines and point at it with this exact
# "../../assets/images/" prefix. The build fails if the file doesn't exist.
# heroImage: "../../assets/images/descriptive-filename.jpg"
# heroImageAlt: "A plain-language description of what is in the picture"
---

The post body goes here, written in ordinary Markdown.

## A section heading

Paragraphs are separated by a blank line. *Italics* and **bold** work, as do
[links](https://example.com), footnotes[^1], and lists:

- one thing
- another thing

> A quotation.

To include a second picture inside the body, put the file in
src/assets/images/ and write:

![A description of the picture](../../assets/images/another-picture.jpg)

[^1]: Footnote text appears at the bottom of the post.
