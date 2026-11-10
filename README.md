# cmdk.fi landing

Astro static site for `cmdk.fi`, served from Cloudflare Workers static assets.

## Commands

- `pnpm install`
- `pnpm dev` — local dev server
- `pnpm build` — builds to `dist/`
- `pnpm check` — after a build: copy rules on the agent files, page against data, links (network; `pnpm check --offline` skips it), indexing, sizes, no copy in components (`scripts/check-copy.mjs`)

All copy lives in `src/content/landing.ts`; `/llms.txt` and `/llms-full.txt` are generated from it (`src/content/agent-doc.ts`).

## Deploy

Automatic on push to `main`. The repo is connected to Cloudflare Workers Builds
(Git integration in the Cloudflare dashboard). Build command `pnpm run build`,
deploy command `npx wrangler deploy`. `dist/` is gitignored; Cloudflare builds it.
No GitHub Actions workflow and no manual wrangler step.
