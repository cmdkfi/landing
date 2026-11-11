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

The responsive light layout uses a warm canvas, white panels, charcoal type and green accents.
The landing and agent page share the app’s palette, local font, cards and buttons.
Phone guidance directs users to a wallet’s built-in browser and marks mobile signing
as experimental, with real-device testing pending. The sandbox needs no wallet.
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
production deploy command `npx wrangler deploy`. Pull-request builds run `npx wrangler preview`,
which requires the `previews: {}` opt-in in `wrangler.jsonc`; static assets and compatibility settings
stay at the top level. `dist/` is gitignored; Cloudflare builds it.
No GitHub Actions workflow and no manual wrangler step.

## Coordinated app release

Merge and deploy [app PR #85](https://github.com/cmdkfi/cmdk-app/pull/85) before this landing change. It removes the desktop gate and adds the responsive sandbox. Mobile signing remains experimental until an open/sign/close rehearsal is recorded on a real phone in a wallet browser. The browser guidance on the landing, command menu and agent documents uses the same qualification.
