# chriszombik.com

This repository **is** Chris Zombik's website. Every word, picture, and style on
[www.chriszombik.com](https://www.chriszombik.com) comes from a file in this folder. Change a file,
push it to GitHub, and about a minute later the live site updates. There is no server, no database, no
admin panel, and no monthly bill: it is a **static site** hosted for free by **GitHub Pages**.

This README is written for the site's owner, who is comfortable with computers but is not a
programmer, and for the AI coding assistants (Codex, Claude Code) that will do most of the hands-on
work. It is deliberately long. Skim the table of contents and jump to what you need.

- [The one-minute version](#the-one-minute-version)
- [How the site works (mental model)](#how-the-site-works-mental-model)
- [One-time setup on a new computer](#one-time-setup-on-a-new-computer)
- [The everyday workflow](#the-everyday-workflow)
- [Map of the repository](#map-of-the-repository)
- [Common tasks](#common-tasks)
- [Content reference (frontmatter fields)](#content-reference-frontmatter-fields)
- [Working with an AI coding assistant](#working-with-an-ai-coding-assistant)
- [Commands](#commands)
- [Deployment, domain, and DNS](#deployment-domain-and-dns)
- [Troubleshooting](#troubleshooting)
- [Glossary](#glossary)
- [History and hand-off notes](#history-and-hand-off-notes)

---

## The one-minute version

- **Posts** are Markdown files in `src/content/posts/`. One file = one post. The filename is the URL.
- **Stories and long-form writing** are the same, in `src/content/writing/`.
- **Pictures** go in `src/assets/images/`.
- **The Home, About, and Now pages** are single files in `src/content/pages/`.
- **Site-wide settings** (site name, navigation, social links) are in `src/content/site/`.
- **Colors and fonts** are in `src/styles/global.css`.
- To see changes locally: `bun run dev`, then open <http://localhost:4321>.
- To check nothing is broken: `bun run build`.
- To publish: commit and push to `main`. GitHub builds and deploys it automatically.

If you use an AI assistant, you can say things like *"add a new post titled X using the text in
draft.md"* or *"update the Now page"* and it will follow the step-by-step **skills** in
`.claude/skills/` (Claude Code) / `.agents/skills/` (Codex, same files).

---

## How the site works (mental model)

1. **You write content in Markdown.** Markdown is plain text with light formatting: `# Heading`,
   `*italic*`, `[link](https://…)`. Each file starts with a small block of settings between two `---`
   lines called **frontmatter** (title, date, summary, and so on).

2. **Astro turns it into a website.** Astro is a *static site generator*. When you run
   `bun run build`, it reads every file under `src/`, applies the page templates in `src/pages/`,
   optimizes the images, and writes finished `.html`, `.css`, and image files into a folder called
   `dist/`. That folder is the entire website. Nothing dynamic happens after that; it is just files.

3. **GitHub Pages serves those files.** Every time a commit is pushed to the `main` branch on GitHub,
   a small robot (a *GitHub Actions workflow*, defined in `.github/workflows/deploy.yml`) runs the
   same `bun run build` on GitHub's computers and copies the resulting files to GitHub Pages, which
   serves them at `www.chriszombik.com`.

So the whole pipeline is: **Markdown files → `bun run build` → HTML files → GitHub Pages**.

Some consequences worth knowing:

- There is **no login and no admin screen**. Editing the site means editing files.
- **Nothing is ever "saved" on the site itself.** No comments, no form submissions, no analytics on
  the server. That is why the Contact page shows an email address rather than a form.
- **A mistake in a file can stop the build.** That is a safety feature: a broken build never reaches
  the live site — the previous version keeps being served until the fix is pushed.
- **Everything is version-controlled with git.** Every change ever made is recorded and can be undone.
  It is very hard to permanently break anything.

---

## One-time setup on a new computer

You need four things. An AI assistant can walk you through each; these are the essentials.

1. **git** — the version-control tool. On a Mac, run `git --version` in Terminal; if it isn't
   installed, macOS offers to install it. Also sign in to GitHub from the command line by installing
   the GitHub CLI: `brew install gh` then `gh auth login`.

2. **Bun** — the JavaScript runtime that runs Astro. Install from <https://bun.sh>
   (`curl -fsSL https://bun.sh/install | bash`). Check with `bun --version`.

3. **This repository.** In Terminal:
   ```bash
   git clone git@github.com:<owner>/zombik_v2.git
   cd zombik_v2
   bun install
   ```
   `bun install` downloads the code libraries the site depends on (Astro etc.) into `node_modules/`.
   It only needs rerunning when `package.json` changes.

4. **An AI coding assistant**, e.g. Claude Code (`npm install -g @anthropic-ai/claude-code`) or
   Codex CLI. Start it *inside* the `zombik_v2` folder so it picks up `AGENTS.md`/`CLAUDE.md` and
   the skills.

No environment variables, API keys, or accounts are needed to build or run the site locally.

---

## The everyday workflow

```
edit files  →  preview locally  →  verify  →  commit  →  push  →  (automatic) deploy
```

1. **Edit.** Change or add files (usually under `src/content/`).
2. **Preview.** `bun run dev` starts a local copy at <http://localhost:4321> that updates as you save.
   Leave it running in a Terminal window; press `Ctrl+C` to stop it.
3. **Verify.** `bun run build` does a full production build. If it prints `Complete!`, the site is
   sound. (`bun run check` and `bun test` are extra checks; the `publish-changes` skill runs all three.)
4. **Commit.** `git add -A && git commit -m "Add post about …"` records the change locally.
5. **Push.** `git push origin main` sends it to GitHub.
6. **Deploy happens by itself.** Watch it under the repository's **Actions** tab on GitHub (or
   `gh run watch`). Green check = live. Typically 30–60 seconds.

Work directly on the `main` branch. This is a one-person site; branches and pull requests are
unnecessary ceremony here.

---

## Map of the repository

```text
zombik_v2/
├── README.md                 ← you are here
├── AGENTS.md                 ← instructions for AI coding assistants (CLAUDE.md is a link to it)
├── templates/                ← annotated starting points to copy for a new post or story
│   ├── post.md
│   └── writing.md
│
├── src/                      ← EVERYTHING THAT BECOMES THE WEBSITE
│   ├── content/              ← ✏️  THE WORDS. This is where almost all editing happens.
│   │   ├── posts/            ←     blog posts, one .md file each  → /posts/<filename>
│   │   ├── writing/          ←     fiction & long-form, one .md each → /writing/<filename>
│   │   ├── pages/            ←     home.md, about.md, now.md
│   │   └── site/             ←     settings.md (title, nav) and author.md (portrait, social links)
│   ├── assets/images/        ← 🖼️  ALL PICTURES. Referenced from content as ../../assets/images/<file>
│   ├── content.config.ts     ←     the rules for frontmatter (which fields exist, which are required)
│   ├── pages/                ←     one file per kind of page: the HTML structure (templates)
│   │   ├── index.astro       ←       /            the homepage
│   │   ├── about.astro       ←       /about
│   │   ├── now.astro         ←       /now
│   │   ├── contact.astro     ←       /contact
│   │   ├── posts/index.astro ←       /posts       the list
│   │   ├── posts/[slug].astro←       /posts/…     one page per post ("[slug]" = fill in the filename)
│   │   ├── writing/…         ←       same pair for /writing
│   │   └── rss.xml.ts        ←       /rss.xml     the feed
│   ├── layouts/BaseLayout.astro ←  the frame every page shares (head tags, header, footer, fonts)
│   ├── components/           ←     reusable pieces: Header, Footer, PostCard, TagList, LocalImage
│   ├── styles/global.css     ← 🎨  ALL STYLING: colors, fonts, spacing, light/dark theme
│   └── lib/                  ←     small helper code: reading content, formatting dates,
│                                   and the encoded contact email (contact-email.ts)
│
├── public/                   ← files copied to the site untouched: favicon.svg and CNAME (the domain)
├── scripts/                  ← encode-contact-email.ts, used by `bun run contact-email`
├── .github/workflows/        ← deploy.yml: the GitHub Actions recipe that builds and publishes
├── .claude/skills/           ← step-by-step guides for AI assistants (see "Common tasks")
├── .claude/settings.json     ← lets Claude Code run the routine build/test/git commands without asking
├── .agents/skills            ← link to .claude/skills so Codex finds the same guides
│
├── astro.config.mjs          ← Astro settings (mainly the site URL)
├── package.json              ← the project's name, scripts (`bun run …`), and dependencies
├── bun.lock                  ← exact dependency versions; changes only when dependencies change
├── tsconfig.json             ← TypeScript checker settings; rarely touched
│
└── (generated, git-ignored, safe to delete)
    ├── dist/                 ← the built website, produced by `bun run build`
    ├── .astro/               ← Astro's cache
    └── node_modules/         ← downloaded dependencies, produced by `bun install`
```

Files you will edit **often**: everything under `src/content/`, plus `src/assets/images/`.
Files you might edit **occasionally**: `src/styles/global.css`, `src/components/Footer.astro`,
`src/pages/contact.astro`.
Files you should **rarely** need to touch: everything else. Each has a comment at the top explaining
what it does.

---

## Common tasks

Each of these has a matching skill in `.claude/skills/<name>/SKILL.md` with exact steps and gotchas.
An AI assistant will use them automatically; you can also read them yourself.

| I want to… | Skill | In short |
|---|---|---|
| Publish a new blog post | `add-blog-post` | Copy `templates/post.md` to `src/content/posts/<slug>.md`, fill in frontmatter, write Markdown |
| Add a story or essay to /writing | `add-writing` | Same, using `templates/writing.md` into `src/content/writing/` |
| Add a picture | `add-images` | Drop it in `src/assets/images/`, reference it as `../../assets/images/<file>` with alt text |
| Update the bio, Now page, or homepage headline | `edit-pages` | Edit the file in `src/content/pages/` |
| Change which posts are featured on the homepage | `edit-pages` | `featuredPosts` list in `src/content/pages/home.md` |
| Change nav links, site title, social links, or the contact email | `edit-site-settings` | `src/content/site/*.md`, `Footer.astro`, `bun run contact-email` |
| Change colors, fonts, spacing, mobile layout | `change-design` | `src/styles/global.css` |
| Put my changes on the live site | `publish-changes` | verify → commit → push → watch the Actions run |
| Something is broken / red X on GitHub | `fix-broken-build` | Read the first error; it names the file |

Things this site intentionally does **not** do, and why:

- **No drafts flag.** Every file in `src/content/posts/` is published. Keep unfinished pieces in a
  `drafts/` folder at the repository root (safe to commit; it is not part of the site) and move them
  in when ready.
- **No comments, no contact form, no newsletter signup.** Each would require a third-party service
  with an account, a key, and something to break. Add one only if you truly want it.
- **No analytics.** Add a privacy-friendly script tag to `BaseLayout.astro` if ever wanted.

---

## Content reference (frontmatter fields)

The authoritative definition, with comments, is `src/content.config.ts`. Summary:

### Posts (`src/content/posts/*.md`) and writing (`src/content/writing/*.md`)

| Field | Required | Example | Notes |
|---|---|---|---|
| `title` | yes | `"Boskone 60"` | Escape inner double quotes as `\"` |
| `publishedAt` | yes | `"2023-02-16T08:00:00.000Z"` | Full ISO date-time ending in `Z`. Sort key, newest first |
| `excerpt` | yes | `"Like a lot of young people…"` | Used in RSS, previews, and search results |
| `tags` | no | `[{"title":"AI","slug":"ai"}]` | Default `[]`. Same `slug` groups posts on the list page |
| `heroImage` | no | `"../../assets/images/boskone-60.jpg"` | File must exist. Shown atop the post; used for social preview |
| `heroImageAlt` | no | `"Crowd at a convention panel"` | Describe the picture; always add when `heroImage` is set |

URL = `/posts/<filename-without-.md>` (or `/writing/…`). Filenames: lowercase, numbers, hyphens.

### `src/content/pages/home.md` (`type: "home"`)

`title`, `heroHeading`, `heroSubheading`, optional `heroImage`/`heroImageAlt` (social preview only),
`featuredPosts` (list of post slugs; empty = three newest).

### `src/content/pages/about.md` (`type: "about"`)

`title`; the Markdown body is the bio.

### `src/content/pages/now.md` (`type: "now"`)

`title`, optional `lastUpdated` (`"YYYY-MM-DD"`, shown under the heading); the body is the page.

### `src/content/site/author.md` (`type: "author"`)

`name`, `roleLine`, optional `portrait`/`portraitAlt`, `socialLinks` (list of `{label, url}`; full
`https://` URLs). Used by the About and Contact pages.

### `src/content/site/settings.md` (`type: "settings"`)

`siteTitle`, `siteDescription`, `navItems` (list of `{title, href}`), optional
`defaultOgImage`/`defaultOgImageAlt`.

### Markdown you can use in bodies

Headings (`##`), paragraphs, `*italic*`, `**bold**`, links, images
(`![alt](../../assets/images/file.jpg)`), bulleted and numbered lists, `> quotes`, `***` horizontal
rules / scene breaks, footnotes (`[^1]` and `[^1]: text`), inline `code` and fenced code blocks, and
raw HTML if you ever need it.

---

## Working with an AI coding assistant

This repository is set up so that Claude Code or Codex can do nearly all maintenance from plain-English
requests. Some habits that make that go well:

- **Start the assistant inside the `zombik_v2` folder.** It then reads `AGENTS.md` / `CLAUDE.md`
  (project rules) and finds the skills.
- **Say what, not how.** *"Add a post called 'Boskone 61' dated March 3 using boskone.txt, with the
  photo at ~/Desktop/panel.jpg"* is a complete request. The skills fill in the how.
- **Ask it to preview before publishing.** *"Show me the result locally first"* → it runs the dev
  server and gives you a `localhost` link. Look at it in your browser.
- **Publishing is a separate step.** The assistants are instructed not to push to GitHub unless you
  ask. Say *"publish it"* / *"push it live"* when you are satisfied.
- **It should always run `bun run build` before pushing.** If it reports a failure, it should fix it,
  not push anyway.
- **When something goes wrong, paste the error.** The `fix-broken-build` skill maps common messages
  to fixes.
- **Ask it to explain.** *"What does this file do?"* — every source file has a header comment written
  for exactly this question.
- **You can always undo.** *"Undo the last change"* / *"revert the last commit"*. Nothing is lost:
  git keeps everything, and GitHub keeps a copy of everything that was ever pushed.

Things to be wary of, and to say no to if an assistant proposes them unprompted:

- Adding new dependencies or services (analytics, forms, CMSs, comment systems) — each one is a
  future maintenance burden.
- "Migrating" to a different framework or host — the current setup is simple on purpose.
- Deleting files it didn't create, rewriting git history (`git push --force`), or editing DNS.

---

## Commands

Run these in Terminal from inside the `zombik_v2` folder. (`bun run <name>` runs a script defined in
`package.json`.)

| Command | What it does |
|---|---|
| `bun install` | Download dependencies. Run after cloning, or when `package.json` changes |
| `bun run dev` | Start the local preview at <http://localhost:4321>; live-reloads on save; `Ctrl+C` stops it |
| `bun run build` | Build the whole site into `dist/`. **The definitive "is it broken?" check** |
| `bun run preview` | Serve the last `dist/` build locally, exactly as GitHub Pages would |
| `bun run check` | Type-check the `.astro`/`.ts` files (catches code mistakes, not content mistakes) |
| `bun test` | Run the unit tests (currently: the contact-email encoding) |
| `bun run contact-email <address>` | Print the encoded form of an email address for `src/lib/contact-email.ts` |
| `git status` / `git diff` | What has changed since the last commit |
| `git log --oneline -10` | The last ten commits |
| `gh run list --workflow deploy.yml` / `gh run watch` | See / follow the GitHub Pages deploys |

---

## Deployment, domain, and DNS

**How it deploys.** `.github/workflows/deploy.yml` runs on every push to `main`: it checks out the
code, runs `bun install` and `bun run build` (via the official `withastro/action`), and uploads `dist/`
to GitHub Pages. The repository's **Settings → Pages** must have *Source* set to **GitHub Actions**
(it is).

**The domain.** The site's address is `www.chriszombik.com`; `chriszombik.com` (no `www`) redirects
to it. Three places must agree on this and only need changing if the domain ever changes:

1. **Settings → Pages → Custom domain** in the GitHub repository (this is what actually matters;
   with Actions-based deploys GitHub ignores the `CNAME` file).
2. `public/CNAME` — kept as a written record of the domain.
3. `site` in `astro.config.mjs` — used for absolute links in the RSS feed and social previews.

**DNS** (at whichever provider manages `chriszombik.com`'s nameservers) must point at GitHub Pages:

- `www` → `CNAME` record → `<github-username>.github.io` (the username of whoever owns this
  repository on GitHub — **if the repository is transferred, update this record**)
- apex `chriszombik.com` → `A` records → `185.199.108.153`, `185.199.109.153`,
  `185.199.110.153`, `185.199.111.153` (GitHub redirects the apex to `www`)

After DNS changes, open **Settings → Pages**, wait for the DNS check to pass, and tick
**Enforce HTTPS**. DNS changes can take up to a day to propagate, usually minutes.

**Transferring the repository** to a different GitHub account (Settings → General → Danger Zone →
Transfer): afterwards, re-check Settings → Pages (Source = GitHub Actions, custom domain set),
update the `www` CNAME record to the new owner's `<username>.github.io`, and update the `git clone`
URL on any computer that has a copy (`git remote set-url origin git@github.com:<new-owner>/zombik_v2.git`).

**Bluesky handle.** Chris's Bluesky handle is `chriszombik.com`. Bluesky verifies that by fetching
`https://chriszombik.com/.well-known/atproto-did`, which is the file `public/.well-known/atproto-did`
in this repository (it contains his account's `did:plc:…` identifier). Do not delete it. If Bluesky
ever shows the handle as invalid, open Bluesky → Settings → Account → Handle → "I have my own domain"
→ `chriszombik.com` → "Verify Text File".

**Cost.** GitHub Pages is free for public repositories. The only recurring cost is the domain
registration itself.

---

## Troubleshooting

**`bun run build` fails.** Read the *first* error. It almost always names a file under `src/content/`
and a field. Compare the file to `templates/post.md`. Common culprits: a missing required field, a
`publishedAt` without the time/`Z`, a `heroImage` path to a file that doesn't exist, a value with a
colon that isn't in quotes. Full table in `.claude/skills/fix-broken-build/SKILL.md`.

**The deploy on GitHub failed (red X).** Click it → the failed step → read the error. It is the same
error `bun run build` would give locally, so reproduce and fix locally, then push. The live site is
unaffected until a build succeeds.

**The deploy succeeded but I don't see my change.** Hard-refresh (`Cmd+Shift+R`). GitHub's CDN can
cache for a few minutes. Confirm you pushed to `main` (`git log origin/main --oneline -1`).

**`bun run dev` says the port is in use.** A previous dev server is still running in another
Terminal window; use that one, or `pkill -f "astro dev"` and retry.

**Weird errors after pulling changes or after a long time.** `rm -rf .astro dist node_modules &&
bun install && bun run build` rebuilds everything from scratch. Safe: those folders are all generated.

**I made a mess and want to go back.** `git status` shows uncommitted changes; `git checkout -- <file>`
discards changes to one file; `git stash` sets all of them aside. To undo the last *pushed* commit:
`git revert HEAD && git push origin main`.

**A dependency security warning / "update available".** These are rarely urgent for a static site.
To update within safe ranges: `bun update`, then `bun run build` and `bun test`; commit `bun.lock`
if all is well. Major Astro upgrades (e.g. 5 → 6) should be done deliberately with an assistant,
following Astro's migration guide.

---

## Glossary

- **Astro** — the static site generator: the program that turns `src/` into a website.
- **Bun** — the runtime that runs Astro and the project's scripts (like Node.js, but faster and simpler).
- **Build** — running Astro to produce the finished website files in `dist/`.
- **Commit** — a saved snapshot of changes in git, with a message.
- **Deploy** — copying the built site to the host (GitHub Pages) so it is live.
- **DNS** — the internet's address book, mapping `chriszombik.com` to GitHub's servers.
- **Frontmatter** — the settings block between `---` lines at the top of a Markdown file.
- **GitHub Actions** — GitHub's automation service; runs `deploy.yml` on every push.
- **GitHub Pages** — GitHub's free static-site hosting.
- **Markdown** — the lightweight text format the content is written in.
- **`main`** — the one and only branch; what is on `main` is what is live.
- **Push / pull** — send commits to GitHub / fetch commits from GitHub.
- **Repository (repo)** — this folder and its full git history.
- **Skill** — a `SKILL.md` file giving an AI assistant step-by-step instructions for one task.
- **Slug** — the URL-safe name of a post: the filename without `.md`.
- **Static site** — a website that is just files, with no server-side code.
- **TypeScript / `.ts`** — JavaScript with type annotations; used for the small helper code in `src/lib/`.
- **`.astro` file** — Astro's template format: some code at the top between `---` lines, then HTML.

---

## History and hand-off notes

- The site was designed and built by [Gabby Welson](https://welson.net) in 2025–26, originally backed by a
  headless CMS and later with a Resend/Cloudflare-Turnstile contact form on Vercel. In August 2026 all of
  that was removed to make the site 100% static and dependency-free ahead of handing it to Chris.
- Content was imported from the previous site; some older posts have `tags: []` simply because tags
  were never assigned. Adding tags is purely optional.
- The design intent: warm paper tones, a serif body face (Literata), monospace labels (IBM Plex Mono),
  a light and a dark theme, generous whitespace, and no clutter. Keep it that way if you can.
