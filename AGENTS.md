# Instructions for AI coding assistants

This file is read automatically by Codex (`AGENTS.md`) and Claude Code (`CLAUDE.md` is a symlink to
it). Read `README.md` for the full picture; this file is the short rulebook.

## What this project is

Chris Zombik's personal website, <https://www.chriszombik.com>: a fully static Astro 5 site deployed to
GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`. Content is Markdown under
`src/content/`; images under `src/assets/images/`; one stylesheet `src/styles/global.css`.

## Who you are working for

The owner is smart and comfortable with computers but is **not a programmer** and does not read
JavaScript or CSS fluently. Therefore:

- Explain what you are doing and why in plain language; name the files you touch.
- Prefer the smallest change that achieves the request. Do not refactor, "modernize", or add
  abstractions unprompted.
- Do not add dependencies, third-party services, frameworks, build tools, or CI steps unless the
  owner explicitly asks and understands the ongoing cost. The site is intentionally dependency-light
  and has no server, no analytics, no forms.
- Never propose migrating away from Astro, Bun, or GitHub Pages.
- Confirm before anything destructive or hard to undo: deleting files you did not create, renaming
  published posts (changes their URL), rewriting git history, force-pushing, changing DNS or GitHub
  settings.

## Skills — use them

Step-by-step procedures live in `.claude/skills/<name>/SKILL.md` (also reachable as
`.agents/skills/`). Follow the matching one:

`add-blog-post` · `add-writing` · `add-images` · `edit-pages` · `edit-site-settings` ·
`change-design` · `publish-changes` · `fix-broken-build`

Templates for new content: `templates/post.md`, `templates/writing.md`.

## Conventions

- **Bun, not Node/npm.** `bun install`, `bun run dev|build|check|preview`, `bun test`, `bunx …`.
- Content files must satisfy the schemas in `src/content.config.ts` (commented). Keep frontmatter
  values double-quoted; `publishedAt` is a full ISO date-time ending in `Z`.
- Post/writing URLs are derived from filenames: lowercase, digits, hyphens.
- Images are referenced from content as `../../assets/images/<file>`; always include alt text.
- Styling goes in `src/styles/global.css`, using the existing CSS variables for colors and fonts and
  keeping the light and dark theme blocks in sync. No inline styles, no new CSS files.
- Every source file starts with a comment explaining its role. Keep those accurate when you change
  behavior, and add one to any new file.
- The contact email is stored encoded in `src/lib/contact-email.ts`. **Never write the plain
  address into any file** in this public repository. Use `bun run contact-email <address>` to
  regenerate it.
- Never commit `.env`, `dist/`, `.astro/`, `node_modules/`, or any credential.
- Work on `main`. No branches or PRs unless asked.

## Before saying a change is done

Run and report the results of:

```bash
bun run check
bun test
bun run build
```

If any fails, fix it before reporting. For content changes, also preview at
`http://localhost:4321/<path>` via `bun run dev` and tell the owner the URL to look at. If a dev
server is already running (port 4321 busy), reuse it rather than starting another.

## Publishing

Do **not** commit or push unless the owner asks ("publish", "push", "deploy", "go live"). When they
do, follow `publish-changes`: verify, commit with a short imperative message, `git push origin main`,
then confirm the GitHub Actions run succeeded (`gh run watch --exit-status`) and report the live URL.
