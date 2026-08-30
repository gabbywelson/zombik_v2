---
name: fix-broken-build
description: Diagnose and fix a failing `bun run build`, `bun run check`, `bun run dev`, or a failed GitHub Pages deploy for chriszombik.com. Use when there is an error message, a red X on GitHub Actions, or the site will not start locally.
---

# Fix a broken build

Read the **first** error in the output; later errors are usually consequences of it.

## Common errors and fixes

| Error text contains | Cause | Fix |
|---|---|---|
| `InvalidContentEntryDataError`, `Required`, `Expected string` | A Markdown file's frontmatter is missing a field or has the wrong type. The message names the file and field. | Open the file; compare with `templates/post.md`; check quotes and spelling of field names. |
| `Invalid datetime` | `publishedAt` is not full ISO format. | Use `"YYYY-MM-DDTHH:MM:SS.000Z"`. |
| `Could not find requested image` / `ImageNotFound` | `heroImage` or a Markdown image path points at a file that doesn't exist. | Check the filename and extension in `src/assets/images/`; path must start with `../../assets/images/`. |
| `Invalid url` | A `socialLinks` entry in `author.md` isn't a full `https://…` URL. | Fix the URL. |
| `YAMLException`, `bad indentation`, `unexpected token` | Frontmatter syntax error (unquoted colon, unbalanced quotes, stray tab). | Put values in double quotes; escape inner quotes as `\"`; use spaces not tabs. |
| `Cannot find module` / `Failed to resolve import` | A dependency is missing or an import path is wrong. | `bun install`; check the path in the import. |
| `EADDRINUSE` / port 4321 in use | A dev server is already running. | Use the one that is running, or stop it (`pkill -f "astro dev"`) and rerun. |
| `getStaticPaths` / `Post not found for slug` | A page references a slug that has no file. | Check `featuredPosts` in `home.md` and any hand-written links. |
| Type errors from `bun run check` mentioning `.astro` files | Code in a page references a field that doesn't exist. | Add the field to `src/content.config.ts` (and content files) or correct the name. |

## Procedure

1. Reproduce locally: `bun run build`. (For a GitHub Actions failure: `gh run view --log-failed`.)
2. Find the first error; note the file path it names.
3. Fix that file. For content errors, diff against a known-good file in the same folder.
4. Rerun `bun run build` until it passes, then `bun run check` and `bun test`.
5. If the failure was on GitHub, push the fix; the deploy reruns automatically.

## When nothing makes sense

- Clear caches and reinstall: `rm -rf .astro dist node_modules && bun install && bun run build`.
- See what changed recently: `git log --oneline -10` and `git diff HEAD~1`.
- Go back to the last working state: `git stash` (sets aside uncommitted changes) then `bun run build`.
  If that passes, the problem is in the stashed changes; `git stash pop` to bring them back and bisect.
- Ask the user before deleting anything or rewriting git history.
