# cmdk.fi landing

Astro static site for `cmdk.fi`, served from Cloudflare Workers static assets.

## Commands

- `pnpm install`
- `pnpm dev` — local dev server
- `pnpm build` — builds to `dist/`
- `pnpm preview --host 127.0.0.1 --port 4321` — serves the build locally
- `pnpm preview:file` — after building, exports `.local-preview/index.html` with embedded styles, fonts and images; open it directly when a local server is unavailable
- `pnpm check` — after a build: copy rules on the agent files, page against data, links (network; `pnpm check --offline` skips it), indexing, sizes, no copy in components (`scripts/check-copy.mjs`)

All copy lives in `src/content/landing.ts`; `/llms.txt` and `/llms-full.txt` are generated from it (`src/content/agent-doc.ts`).

## Visual design

The responsive light layout follows the approved `../design-proposals/full-light-v3/`
proposal. The landing and agent page share its palette, local font, cards and buttons.
The app still requires a desktop browser; the mobile landing retains that notice.
The feature directory supports search and status filters; native disclosures and the
complete feature inventory remain available without JavaScript.
With JavaScript enabled, Cmd+K / Ctrl+K opens quick navigation on both pages.
The header shortcut button and mobile menu provide clickable entry points.
Tab and Enter navigate the links; Escape closes the panel. The shortcut leaves
text fields, editable content and other open dialogs alone.

The file preview is generated from the build and stays outside the deploy directory.
Clipboard permissions vary for local files; use the HTTP preview for browser QA of
copy actions and routing. Regenerate the file preview after each build.

## Deploy

Automatic on push to `main`. The repo is connected to Cloudflare Workers Builds
(Git integration in the Cloudflare dashboard). Build command `pnpm run build`,
deploy command `npx wrangler deploy`. `dist/` is gitignored; Cloudflare builds it.
No GitHub Actions workflow and no manual wrangler step.
