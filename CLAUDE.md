# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Vite dev server (`--host`, so it's reachable on the LAN too)
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the production build locally

There is no test suite, linter, or type checker configured in this project.

## Architecture

This is a static multi-page site (Vite MPA, not an SPA) that acts as a landing page/portfolio for a collection of independent games and apps. There are three separate HTML entry points built by Rollup, wired up in `vite.config.js`'s `rollupOptions.input`:

- `index.html` — homepage, lists featured games/apps
- `games/index.html` — full games listing
- `apps/index.html` — full apps listing (currently empty, "Coming soon")

Shared styling lives in `src/style.css`, imported by all three entry pages.

### Individual projects live under `public/`, as git submodules

Each game/app is its own standalone repo, pulled in as a git submodule under `public/games/<name>/` or `public/apps/<name>/` (see `.gitmodules`). For example, `public/games/roulette/` is the submodule for `github.com/DangItsTY/roulette`. Because these live in `public/`, Vite copies them into `dist/` unprocessed (untouched by the bundler) — they're plain static HTML/CSS/JS apps with their own `index.html`, not part of the Vite build graph.

When adding a new project: add it as a submodule under `public/games/` or `public/apps/`, then add a card linking to it in the relevant listing page(s) (`index.html` and/or `games/index.html`/`apps/index.html`).

### Vanity URLs (masking the real submodule path)

The public-facing URL for a project doesn't have to match its real path under `public/`. For example, the roulette game physically lives at `public/games/roulette/` but is reachable at `/roulette` instead of `/games/roulette`. This is deliberate — it keeps the on-disk layout organized by category while giving each project a clean top-level URL — and is implemented in two places that must be kept in sync:

- **Dev**: the `VANITY_ROUTES` map inside the custom `publicDirIndex` Vite plugin in `vite.config.js`. It 302-redirects the bare path (e.g. `/roulette`) to its trailing-slash form, then internally rewrites `/roulette/*` to `/games/roulette/*` before falling through to Vite's static file serving.
- **Prod**: `public/_redirects`, using the Netlify-style redirects syntax that Cloudflare Pages (this project's deploy target) also supports. Same two rules: an exact-match 301 to add the trailing slash, then a `/roulette/* -> /games/roulette/:splat` rewrite (status 200, so the URL bar doesn't change).

To add a new vanity route, add an entry to `VANITY_ROUTES` and the matching pair of lines in `public/_redirects`.

### Directory-index serving

Vite's dev server doesn't serve `index.html` for directory-style requests (e.g. `/games/roulette/`) out of the box the way a static host does. The `publicDirIndex` plugin in `vite.config.js` fixes this for dev only, so local behavior matches how Cloudflare Pages serves the production build.

## Deployment

Deploys to **Cloudflare Pages**, built from `dist/`. Redirect/rewrite rules for production must use the `_redirects` file format (not `netlify.toml`, not GitHub Pages-style config) in `public/_redirects`.
