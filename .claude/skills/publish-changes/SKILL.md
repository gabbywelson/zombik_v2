---
name: publish-changes
description: Verify, commit, push, and deploy changes to the live chriszombik.com site via GitHub Pages, then confirm the deploy succeeded. Use when asked to publish, deploy, push, go live, or "make it show up on the site".
---

# Publish changes

The live site is rebuilt and deployed **automatically** by GitHub Actions every time a commit is pushed
to the `main` branch. Publishing therefore means: verify → commit → push → watch the deploy.

## 1. Verify locally (always)

```bash
bun run check    # type-checks the .astro/.ts files
bun test         # unit tests
bun run build    # full production build — the same thing GitHub will run
```

All three must pass. If `bun run build` fails, fix it first (see the `fix-broken-build` skill).
Never push a commit whose build fails: the deploy would fail and the live site would simply keep
showing the previous version, which is confusing.

## 2. Review what changed

```bash
git status
git diff
```

Make sure only intended files changed. Never commit `.env`, `dist/`, `node_modules/`, or `.astro/`
(they are git-ignored, but check anyway).

## 3. Commit

```bash
git add -A
git commit -m "Short description in the imperative, e.g. Add post about Boskone 61"
```

## 4. Push

```bash
git push origin main
```

If the push is rejected because the remote has new commits (e.g. edited on GitHub.com), run
`git pull --rebase origin main`, resolve any conflicts, rerun `bun run build`, then push again.

## 5. Watch the deploy

```bash
gh run list --workflow deploy.yml --limit 1        # find the run
gh run watch --exit-status                          # follow it (about 30–60 seconds)
```

Or open the repository on GitHub → **Actions** tab. A green check means it is live.
If it fails, `gh run view --log-failed` shows the error; it is almost always the same error
`bun run build` would have shown locally.

## 6. Confirm on the live site

Open `https://www.chriszombik.com/<the page you changed>`. Browsers and GitHub's CDN may cache for a
few minutes; a hard refresh (Cmd+Shift+R) usually shows the new version. The RSS feed is at
`https://www.chriszombik.com/rss.xml`.

## Undoing a bad publish

The fastest fix is to correct the problem and push again. To roll back entirely:

```bash
git revert HEAD          # makes a new commit that undoes the last one
git push origin main
```
