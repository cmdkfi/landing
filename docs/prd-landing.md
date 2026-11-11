# PRD — cmdk.fi landing, v1 (structure and copy)

Written 10 Nov 2026 for the implementation session. Repo `cmdkfi/landing`, branch `main`.
Decisions D1–D6, settled by the founder (10 Nov 2026):

- D1. Four status chips on every feature: Live on testnet / Production release / Roadmap / Exploring.
- D2. Chained loans ("degen mode") are left out.
- D3. Gold, RWA (tokenized house), yield on borrowed USDC, best-rate routing: shown as Exploring, no yield figures.
- D4. Crash promise wording: "keeps your loan away from liquidation while you are away".
- D5. Keep `noindex` until the visual pass.
- D6. "Ask your agent": approved; bar after the hero, not a timed popup.

## 0. Summary

Replace the "cmdk.fi coming soon" page with a complete landing page that shows the product vision: lend many assets, borrow USDC, and let an agent that cannot move your money look after the loan across markets, venues and chains.

| Topic | v1 |
|---|---|
| What ships | One page (`/`) with 14 sections, an "Ask your agent" page (`/agents`) and bar, and two machine-readable files (`/llms.txt`, `/llms-full.txt`). |
| What it sells | The vision. Every feature shows its status: Live on testnet, Production release, Roadmap, Exploring. |
| Main action | Open the testnet app: `https://testnet.cmdk.fi`. Second action: run the market crash in the sandbox. |
| What is out | Visual design. v1 is structure, copy and behaviour on the existing three colour tokens and the monospace font. A visual pass follows separately. |
| Indexing | Not indexed (D5), but readable by assistants that fetch a URL (section 8.4). |

## 1. Goals and non-goals

**Goals**
1. A reader understands in one screen what cmdk is and can open the testnet app.
2. A reader who scrolls sees the whole vision and, for each part, whether it exists today.
3. A reader who does not want to read can hand the page to their own AI assistant in one click and get an accurate explanation.
4. No sentence on the page or in the agent files breaks the copy rules (section 4).
5. All copy lives in one data file, so the visual pass and later edits do not touch text in markup.

**Non-goals (v1)**
- Visual identity, illustrations, animation, the app's `CmdkReference` font, dark/light toggle. Keep the current `global.css` tokens; add only layout utilities.
- Wallet connection, live on-chain data, any call to the relayer or an RPC.
- Blog, docs site, pricing page, waitlist form, analytics, cookies.
- Translations.
- Chained loans ("degen mode"): left out (D2).

## 2. Audience

| Reader | What they need |
|---|---|
| Holder who borrows or wants to (ETH, BTC, later stocks); comfortable with a wallet, not a developer | The promise, how the loan is protected, what the agent can and cannot do, a way to try it without money. |
| Security-minded reader (protocol people, investors, hackathon judges, including AI judges) | Exact limits on the agent, what is live versus planned, honest limits, links to code and evidence. |
| The reader's AI assistant | One complete, labelled text file. |

Tone (from the team's design notes): calm, precise, trustworthy, "like a good bank statement, not a trading terminal". No hype, no countdowns.

## 3. Sources of truth

The builder writes copy from these, not from memory and not from this PRD's summaries when a number is involved.

| Topic | Source |
|---|---|
| What the build runs, what production adds, what is roadmap | The team's build/production/roadmap table (internal; copied in the `cmdkfi/app` README; its column order is binding) |
| What may be claimed and how | The team's copy rules (internal) |
| Product description, guarantees table, limitations, roadmap sentence, market figures | `README.md` of `cmdkfi/app` (`main`) |
| Research figures | `research/` of `cmdkfi/app` (liquidation-backtest, liquidation-dataset, judge-evidence, venue-coverage, costs) |
| The testnet app: flow, terms, sandbox | `docs/prd-guided-flow.md` of `cmdkfi/cmdk-app`, branch `feat/guided-flow` |
| Settled product decisions | The team's decision log (internal) |

Rule: every number and every factual claim in `src/content/landing.ts` carries a comment with file and line of its source. A claim with no source is not written; ask the founder.

## 4. Copy rules (binding)

The team's copy rules apply in full. The parts that shape this page:

**Status model (D1).** Every feature, asset, venue and chain shown on the page has exactly one status. The status is part of the data, rendered as a chip next to the item, and written on the same line in the agent file.

| Status | Meaning | Chip text |
|---|---|---|
| `live` | Runs today on NEAR testnet and Base Sepolia | Live on testnet |
| `production` | In the first production release, after an audit | Production release |
| `roadmap` | Listed in the roadmap column of `build-scope.md` or the README roadmap sentence | Roadmap |
| `exploring` | Founder's idea, not in `build-scope.md`; no commitment (D3) | Exploring |

Nothing moves between statuses in copy. Where a section mixes statuses, order is live, production, roadmap, exploring.

**Never write**
- "never get liquidated", "liquidation-proof", "guaranteed", "risk-free", "insured", "safe" as a promise, "trustless" unqualified, "audited".
- "don't care about a crash" or any wording that says the reader can stop caring. Approved wording (D4): "keeps your loan away from liquidation while you are away".
- "the AI predicts crashes", "beats the market", or that the AI caught what rules missed.
- Yield, APY or return figures; "mainnet", "real money" as something available now.
- "The agent cannot cost you more than X".
- "four actions". The build has three: reduce, migrate, exit.
- "degen", "DeFAI", "autonomous wealth", "set and forget".
- Names of companies, judges or partners as endorsers; negative comparisons that name a competitor.
- Protection from a hack. `app/README.md` lists "Protection from venue bugs" under "Not claimed". Say what the agent can do when a market shows stress, and that spreading across venues limits how much sits in one place.

**Always**
- Testnet line near every primary action: "Runs on NEAR testnet and Base Sepolia. Unaudited. No real money."
- Replay figures: "simulated", "positions above $1,000", credited to the corridor (the limits), not to the AI.
- Incident figure (6 of 8): with "as did simple rules" and "tested on suppliers and depositors".
- At least two honesty lines from section 5.13 on the page.

**Words.** Loan, collateral, borrow, LTV (explain once: "how much you owe versus what your collateral is worth"). "Agent" for the AI part. "Vault" for the NEAR contract; never a place the user sends funds. "Position address" for the Base address. "Corridor" for the user's limits; on first use explain as "limits you set". "Lend" in the founder's sense means posting an asset as collateral; write "use as collateral" or "deposit" so it is not read as earning interest.

## 5. Page structure and draft copy

One page, one column, sections in this order. Each section has an `id` for anchors. Draft copy below is the starting text; the builder may tighten it but may not add claims. Headings are sentence case.

### 5.1 Header (`header`)
- Brand mark text `⌘K` linking to `/`.
- Anchors: How it works (`#how`), Assets and venues (`#assets`), Security (`#control`), Status (`#status`).
- Link: "Ask your agent" → opens the dialog (8.3); `href="/agents"` as fallback.
- Primary button: "Open testnet app" → `https://testnet.cmdk.fi`.
- Under 720 px the anchors collapse; brand, "Ask your agent" and the primary button stay.

### 5.2 Hero (`#top`)
- H1: "Borrow against what you hold. An agent looks after the loan, and it cannot move your money."
- Sub: "Deposit crypto, and later stocks and gold, as collateral. Borrow USDC. An AI agent keeps your loan away from liquidation while you are away, inside limits you set."
- Primary: "Open testnet app" → `https://testnet.cmdk.fi`.
- Secondary: "Run a market crash in the sandbox" → `https://testnet.cmdk.fi/#sandbox/start`. Caption: "No wallet needed. Simulated."
- Testnet line (section 4).
- Three proof points, one line each:
  1. "The agent cannot send your money anywhere."
  2. "It acts only inside limits you set."
  3. "Every action is checked on-chain before anything moves."

### 5.3 Problem (`#problem`)
- H2: "DeFi risk is more than one person can watch."
- Three short blocks:
  1. **Prices fall while you sleep.** "A liquidation sells most of your collateral at the bottom." Figures from `app/README.md` l.144: about 3,300 Coinbase borrowers liquidated in one week of February 2026; about $394M liquidated on the Base cbBTC/USDC market between November 2025 and July 2026. Factual, sourced, no negative comment on the company.
  2. **Venues have bad days.** "Rates spike, liquidity dries up, an oracle misbehaves. You find out after it matters."
  3. **Too many places.** "Hundreds of lending markets on many chains, each with its own rates and rules. Watching them is a job."
- Closing line: "Alerts tell you. They do not act."

### 5.4 Who it is for (`#for`)
- H2: "For people who hold and do not plan to sell."
- Body: "If you intend to keep your ETH, BTC or stocks for years, selling to get cash means giving up the position. Borrowing against it keeps the position, but a loan needs looking after every day. cmdk is the tool that does the looking after."
- One line on the user's part: "You choose the asset, the amount and the limits. You keep the only key that can withdraw."

### 5.5 Pillar: the market falls (`#market`)
- H2: "When the market falls, the agent adjusts the loan."
- Items (each with a status chip):
  - `live` "Sells a small part of the collateral early to repay debt, so the loan does not arrive at a crash close to the line."
  - `live` "Above the line you set, it brings the loan back to your target."
  - `production` "Buys back after a recovery, inside a ceiling and a daily budget you set."
  - `roadmap` "Rebalances across assets when you hold more than one."
- Evidence box (wording fixed by `copy-rules.md`):
  - "Simulated: across 20,479 real Morpho liquidations, the corridor avoids all but 7 of 6,906 for positions above $1,000."
  - "Simulated: in a fall from $100k to $55k, a liquidated 0.1 BTC loan keeps 0.01 BTC; a plain rule inside the corridor keeps about 0.059."
  - "What saved positions on 10 October 2025 was the buffer built days earlier, not speed."
- Honesty line: "Protection is risk management, not insurance. A dip that recovers costs you something."
- Link: "See it in the sandbox" → `https://testnet.cmdk.fi/#sandbox/start`.

### 5.6 Pillar: a venue shows stress (`#venue`)
- H2: "When a market shows stress, the agent moves the loan."
- Items:
  - `live` "Moves your loan to another market you approved, with the same collateral and the same debt, without selling."
  - `live` "Exits the market if no approved market can take the loan, if you allowed it."
  - `roadmap` "Moves between venues and chains: Morpho, Aave-style venues, Rhea on NEAR, Kamino on Solana."
  - `roadmap` "Caps per venue and per chain, so one incident reaches only part of what you hold."
- Evidence: "On venue stress in 8 real incidents (tested on suppliers and depositors), the agent's AI exited in time in 6, as did simple rules, and often warned earlier."
- Limit, stated plainly: "No tool protects you from a bug in a lending protocol. Spreading across venues limits how much sits in one place."

### 5.7 Pillar: any asset, any venue, any chain (`#assets`)
- H2: "One vault for what you hold, wherever the best market is."
- Three grids, each row an item with a chip. Source: `build-scope.md` plus D3.

| Group | Item | Status |
|---|---|---|
| Collateral | ETH | live |
| Collateral | BTC | production |
| Collateral | Tokenized stocks, with deleveraging before the weekend price freeze | roadmap |
| Collateral | More crypto assets (NEAR and others) | roadmap |
| Collateral | Gold (tokenized) | exploring |
| Collateral | Real-world assets, for example tokenized property | exploring |
| Borrow | USDC | live |
| Venues | Morpho on Base | live |
| Venues | Aave-style venues | roadmap |
| Venues | Rhea on NEAR | roadmap |
| Venues | Kamino on Solana | roadmap |
| Chains | Base (position), NEAR (vault) | live |
| Chains | Deposit and withdraw from any chain through NEAR Intents | production |
| Chains | A private route for deposits and withdrawals (Confidential Intents) | production |
| Chains | Solana, more EVM chains | roadmap |
| Rates | Borrow where the rate is best among venues you approved | exploring |

- Note under the grid: "Live means the testnet build: ETH is deposited as WETH on Base Sepolia."

### 5.8 Pillar: the agent cannot move your money (`#control`)
- H2: "The agent can save your loan. It cannot move your money."
- All items `live`; wording from the "Say freely" list in `copy-rules.md`:
  - "The agent's key can call only three actions: reduce, move, exit. None of them names a recipient."
  - "Money leaves only when your wallet signs a withdrawal."
  - "The agent acts only inside your corridor: how low your LTV may go, how much it may sell per day, whether it may move your loan or exit."
  - "Every action is re-checked on Base against the market's own price before anything moves."
  - "The vault is immutable: no admin key, no upgrade, not even ours."
  - "The agent's code runs in a hardware enclave, and your vault checks its fingerprint on-chain before giving it a key. A new agent version needs your approval."
  - "Revoking the agent takes one signature."
  - "You sign with the wallet you already have. No new keys."
- Later items: `production` "Smart wallets and passkeys." `roadmap` "A backstop that works when the agent is down."
- Honesty line: "A compromised agent can still cost you money, but only inside your corridor."
- Link: "Read the security model and its limits" → `https://github.com/cmdkfi/app#readme`.

### 5.9 Strategies, later (`#strategies`)
- H2: "More than protection, later."
- Intro: "Nothing in this section exists yet."
- Items:
  - `roadmap` "Rebalancing across assets, with caps across venues."
  - `roadmap` "Hedged mode: stock collateral with a short position against it."
  - `exploring` "Putting borrowed USDC to work in a venue you approve." No figures, no "yield" number.
  - `exploring` "Best-rate routing for new loans."

### 5.10 How it works (`#how`)
- H2: "Three steps."
  1. **Choose.** "Pick the asset, the amount and your limits."
  2. **Sign.** "Sign with your own wallet. Your vault opens the loan and the USDC arrives in your wallet."
  3. **Leave it.** "The agent checks the loan and the market around the clock and acts inside your limits. You can close or revoke at any time."
- Caption: "On testnet today: ETH to USDC on Morpho with preset limits, two transactions and three signatures." Source: guided-flow PRD S4.
- Button: "Open testnet app".

### 5.11 Proof (`#proof`)
- H2: "Check it yourself."
- Links, each with one line:
  - "The code" → `https://github.com/cmdkfi/app`
  - "The research and the data" → `https://github.com/cmdkfi/app/tree/main/research`
  - "The agent's evidence" → `https://relayer.cmdk.fi/agent`
  - "The testnet app" → `https://testnet.cmdk.fi`
- One line: "Built on NEAR: Chain Signatures, Global Contracts, function-call keys, NEAR AI Cloud."

### 5.12 Status (`#status`)
- H2: "What exists today, and what comes next."
- A table generated from the data file: every item on the page grouped by status, in the order live, production, roadmap, exploring. No dates.
- Under the table: "Unaudited. The first production release follows an audit."

### 5.13 Honest limits and FAQ (`#limits`)
- H2: "What cmdk does not do."
- Honesty lines (verbatim from `copy-rules.md`):
  - "Protection is risk management, not insurance. A dip that recovers costs you something."
  - "If NEAR, the signing network or the agent is down, your loan waits. A backstop is on our roadmap."
  - "A compromised agent can still cost you money, but only inside your corridor."
  - "A price gap faster than every layer still liquidates."
- FAQ (question, short answer, each answer sourced):
  1. Can the agent take my funds?
  2. What can the agent do without asking me?
  3. What happens if the agent is offline?
  4. Is this live with real money? ("No. Testnet only; unaudited.")
  5. Which assets and venues work today?
  6. What does it cost? ("Pricing is not decided. The testnet build charges no fees.")
  7. Is my position private? ("Not in the testnet build: positions are public. A private funding route is in the first production release.")
  8. Can I run the agent myself? ("Documented, command line.")

### 5.14 Ask your agent (`#agent`)
See section 8.

### 5.15 Final action and footer
- H2: "Try it without money." Buttons: "Open testnet app", "Run a market crash in the sandbox".
- Footer: `⌘K cmdk`, links (Testnet app, GitHub `https://github.com/cmdkfi/app`, `mailto:team@cmdk.fi`, Ask your agent, `/llms.txt`), the testnet line, "Protection is risk management, not insurance.", "© 2026 cmdk".

## 6. Feature inventory (the data file's content)

The table in 5.7 plus the chip items in 5.5, 5.6, 5.8 and 5.9 are the full inventory. Each entry in `landing.ts`:

```ts
type Status = 'live' | 'production' | 'roadmap' | 'exploring';
interface Feature {
  id: string;            // stable slug
  group: 'collateral' | 'borrow' | 'venue' | 'chain' | 'market' | 'venue-risk' | 'control' | 'strategy';
  title: string;         // short name, used in the status table
  text: string;          // the sentence shown in its section
  status: Status;
  source: string;        // file:line, or 'founder D3 10 Nov 2026' for exploring items
}
```

An item appears in its section and in the status table from the same entry. No feature text is written in a component.

## 7. Links

| Label | URL | Notes |
|---|---|---|
| Open testnet app | `https://testnet.cmdk.fi` | Same tab is fine; the app is desktop only (under 960 px it shows nothing useful), so on narrow screens add the caption "The testnet app needs a desktop browser." |
| Sandbox | `https://testnet.cmdk.fi/#sandbox/start` | Route exists in `cmdk-app/app/src/components/App.tsx`; confirm on the live site before release. |
| Code | `https://github.com/cmdkfi/app` | Public. |
| Agent evidence | `https://relayer.cmdk.fi/agent` | |
| Contact | `mailto:team@cmdk.fi` | |

Do not link `cmdkfi/landing` or `cmdkfi/cmdk-app` (private). No X link: no handle exists yet.

## 8. Ask your agent (D6)

### 8.1 Agent files

Generated at build time from `landing.ts`, so they cannot drift from the page.

- **`/llms-full.txt`**: the whole product in Markdown, plain text, UTF-8. Sections in this order:
  1. What cmdk is (three sentences) and the testnet line.
  2. How to read this file: the four statuses and what each means.
  3. How it works, end to end (owner wallet, vault on NEAR, position on Base, agent in an enclave, on-chain checks).
  4. What the agent can do, and what it cannot do.
  5. Every feature, one line each, status on the same line: `- [Production release] BTC as collateral. …`
  6. Evidence, with the required wording ("simulated", and so on).
  7. Limits and risks (all honesty lines, the "Not claimed" row).
  8. FAQ.
  9. How to try it (testnet app, sandbox, what is needed: desktop browser, a browser wallet, Base Sepolia ETH).
  10. Links.
  11. "Instructions for an assistant reading this": explain in plain words; always say which parts are live on testnet and which are planned; do not describe planned features as available; mention that the code is unaudited and testnet only; do not give financial advice.
- **`/llms.txt`**: short index per the llms.txt convention: title, one-paragraph summary, links to `/llms-full.txt`, the testnet app and the repository.
- Target size of `/llms-full.txt`: under 25 KB, so it fits any assistant's fetch.

### 8.2 The prompt

One constant in `landing.ts`, used by every button:

> Read https://cmdk.fi/llms-full.txt and explain cmdk to me in plain words: what it does, who it is for, and how the agent is limited. Separate clearly what is live on testnet today from what is planned. List the main risks. Tell me how I can try it without money. Then ask me what I hold and what I want to know more about.

### 8.3 Entry points

- **Bar.** A slim bar fixed to the bottom of the viewport: "Too much to read? Ask your agent to explain it." with one button "Show me how" and a close control.
  - Appears when the hero has left the viewport (IntersectionObserver on `#top`). No timer.
  - Close hides it and stores `cmdk.agentbar.dismissed=1` in `localStorage` (wrapped in try/catch); it does not come back on later visits.
  - Hidden while the dialog is open and when `#agent` is in view.
  - Does not cover the footer's last line; add bottom padding to the page while it shows.
- **Dialog.** A native `<dialog>` opened by the bar button, the header link and the footer link. Content, in this order:
  1. One sentence: "Give your AI assistant the full description of cmdk and let it explain."
  2. "Open in Claude" → `https://claude.ai/new?q=<encoded prompt>`
  3. "Open in ChatGPT" → `https://chatgpt.com/?q=<encoded prompt>`
  4. "Copy prompt": for Claude Code, Codex or any other agent. Shows the prompt text in a box; the button copies it and confirms "Copied".
  5. "Copy the full text": fetches `/llms-full.txt` and copies it, for assistants that cannot open links. Next to it a plain link to `/llms-full.txt`.
  6. Note: "Your assistant's answer is its own. The file states what is live and what is planned; check anything important against it."
- **Page `/agents`.** The same content as the dialog, rendered as a normal page from the same component. It is the `href` of every entry point, so everything works without JavaScript, and it is a link people can share.
- **Section `#agent`** on the landing: heading "Prefer to ask?", one sentence, and the button that opens the dialog.

Verify at build time that both prefilled-chat URL formats still open a new chat with the text filled in. If one does not, remove that button and keep the copy options.

### 8.4 Robots and indexing

Today `public/robots.txt` is `Disallow: /`. Assistants that fetch a URL on a user's request generally obey `robots.txt`, so that line would break the feature. Change:

- `robots.txt`: `User-agent: *` / `Allow: /`.
- Keep the page out of search (D5) with `<meta name="robots" content="noindex">` on every HTML page, and `X-Robots-Tag: noindex` on `/llms.txt` and `/llms-full.txt` through `public/_headers`.
- Confirm in the Cloudflare docs that Workers static assets apply `_headers`; if not, say so and stop on this point.

## 9. Architecture

```
src/
  content/landing.ts        all copy: sections, features, FAQ, links, prompt (single source)
  content/agent-doc.ts      builds the Markdown for llms-full.txt and llms.txt from landing.ts
  layouts/Base.astro        head, meta, noindex, header, footer, bar, dialog
  components/               one per section (Hero, Problem, ForWhom, PillarMarket, PillarVenue,
                            Assets, Control, Strategies, HowItWorks, Proof, StatusTable, Limits,
                            AgentSection, FinalAction), StatusChip, AgentPanel, AgentBar
  pages/index.astro         composes the sections
  pages/agents.astro        AgentPanel as a page
  pages/llms.txt.ts         static endpoint
  pages/llms-full.txt.ts    static endpoint
  pages/404.astro           unchanged
  scripts/agent.ts          bar visibility, dialog open/close, copy buttons (small, no framework)
public/
  robots.txt, _headers, favicon.svg
scripts/
  check-copy.mjs            section 10
```

- Astro 5 static output, Tailwind 4, pnpm 11.7.0. No UI framework, no new runtime dependency. pnpm 11 needs the `allowBuilds` map already in `pnpm-workspace.yaml`.
- Deploy is unchanged: Cloudflare Workers Builds on push to `main`. The builder does not push; the founder decides when.
- Styling in v1: the existing tokens (`--bg`, `--fg`, `--fg-muted`), one column, max width about 720 px, readable spacing, chips as bordered text. Nothing decorative.

## 10. Checks

`scripts/check-copy.mjs`, run as `pnpm check` after `pnpm build`:

1. **Copy rules on `dist/llms-full.txt`** (one feature per line, status on the line). Port the rule table from the team's internal copy check (phrase regex, clearing-label regex), and add the landing rules: no `yield|APY|returns?` next to a digit or `%`; none of `degen`, `DeFAI`, `set and forget`, `autonomous wealth`, `don't care`, `risk-free`, `guaranteed`; `four (actions|methods)`. Print `file:line [rule] CHECK text`; exit 1 on any CHECK.
2. **Page matches data.** Every feature `text` and its chip text appear in `dist/index.html`; every item appears once in the status table.
3. **Links.** Every in-page anchor has a target; every external URL in `landing.ts` answers 200 (network step, may be skipped offline with a printed warning).
4. **Indexing.** `noindex` meta on `index.html` and `agents.html`; `robots.txt` allows `/`; `_headers` present.
5. **Size.** `dist/llms-full.txt` under 25 KB.

## 11. Non-functional

- Works with JavaScript off: all content readable, all links work, `/agents` replaces the dialog; only the bar and the copy buttons need JavaScript.
- Readable from 360 px wide; no horizontal scroll; tables scroll inside their own container.
- Accessible: one H1, ordered headings, real buttons and links, dialog focus handled by the native element, visible focus, chips are text and not colour alone.
- No third-party requests, no analytics, no cookies, no fonts from the network.
- Page weight: HTML and CSS under 100 KB before compression; script under 5 KB.

## 12. Acceptance criteria

1. `/` shows the 14 sections of section 5 in order, with the anchors of 5.1.
2. Every item of 5.5–5.9 shows exactly one status chip, and the status table lists all of them grouped live, production, roadmap, exploring.
3. "Open testnet app" appears in the header, hero, how-it-works and final action and opens `https://testnet.cmdk.fi`; the sandbox link opens the sandbox.
4. The testnet line appears in the hero and the footer; at least two honesty lines appear on the page.
5. The bar appears after the hero leaves the viewport, never before; closing it keeps it closed after reload.
6. The dialog opens from bar, header and footer; "Copy prompt" and "Copy the full text" put the right text on the clipboard; the two chat links open a new chat with the prompt filled in (or were removed per 8.3).
7. `/agents`, `/llms.txt` and `/llms-full.txt` are served; `/llms-full.txt` has the 11 parts of 8.1 and every feature line carries its status.
8. `pnpm build` and `pnpm check` pass with no CHECK lines.
9. Pasting the prompt into Claude and into ChatGPT gives an explanation that separates live from planned and contains none of the never-write phrases; the builder records both answers in the report for the founder.
10. No file under `src/components` contains product copy other than through `landing.ts`.
11. Nothing is committed or pushed without the founder's word.

## 13. Risks

| Risk | Handling |
|---|---|
| The vision reads as available today | Status chip on every item; the status table; "Nothing in this section exists yet" on strategies. |
| An assistant overstates when explaining | The file's own instruction block, status on every feature line, the note in the dialog, acceptance criterion 9. |
| Assistant cannot fetch the URL | "Copy the full text". |
| Exploring items are taken as commitments | The chip, no dates, no figures; D3 is the founder's decision and is cited in the data. |
| The testnet app is desktop only, the landing is not | Caption on narrow screens (section 7). |
| Figures go stale | Each carries its source; the check script does not verify numbers, so a figure changes only together with its source comment. |
| A push deploys to cmdk.fi immediately | No push without the founder's word. |

## 14. Open items for the founder

- An X handle, when it exists, goes into the footer.
- `check-copy.sh` in prime has a fixed file list; the landing gets its own port (section 10). If the rule table changes in prime, the port is updated by hand.
- "Exploring" is a new status, not in `build-scope.md`. If it should be recorded there, that needs a line in the team's decision log.

## 11 November 2026: responsive app update

The desktop-only requirement in sections 7, 8 and the risk table is superseded by app PR #85. Deploy that app change before landing PR #1. The sandbox supports desktop and mobile. Phone signing requires a wallet’s built-in browser and remains experimental, with a real-device rehearsal pending; use that qualification in the command menu, mobile caption and agent instructions.
