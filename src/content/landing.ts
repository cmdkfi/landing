// All copy for cmdk.fi: page sections, features, FAQ, links, the agent prompt.
// Single source (docs/prd-landing.md section 6). Components render this file; they hold no copy.
//
// Source abbreviations used in comments and in Feature.source:
//   README       README.md of cmdkfi/app (main)
//   COPY         the team's copy rules (internal; what may be claimed and how, applied by scripts/check-copy.mjs)
//   SCOPE        the team's build/production/roadmap table (internal; copied in the cmdkfi/app README)
//   FLOW         docs/prd-guided-flow.md of cmdkfi/cmdk-app (branch feat/guided-flow)
//   VENUES       research/venue-coverage/near_and_stock_lending.md of cmdkfi/app
//   INCIDENTS    research/judge-evidence/incident-replay-results.md of cmdkfi/app
//   PRD          docs/prd-landing.md (this repository)
//   D3           founder decision D3, 10 Nov 2026 (docs/prd-landing.md): exploring items, no commitment
//
// Rules: every number and factual claim carries its source. Nothing moves between statuses.
// Erasable TypeScript only (no enums): scripts/check-copy.mjs imports this file with Node's type stripping.

export type Status = 'live' | 'production' | 'roadmap' | 'exploring';

export type Group =
  | 'collateral'
  | 'borrow'
  | 'venue'
  | 'chain'
  | 'market'
  | 'venue-risk'
  | 'control'
  | 'strategy';

export interface Feature {
  id: string; // stable slug
  group: Group;
  title: string; // short name, used in the status table
  text: string; // the sentence shown in its section
  status: Status;
  source: string; // file:line, or D3 for exploring items
}

export const SITE_ORIGIN = 'https://cmdk.fi';

// Copy for the isolated /1 first-screen design preview. This route makes no new product claims.
export const concept = {
  title: 'cmdk — first screen concept',
  skip: 'Skip to content',
  home: 'cmdk home',
  logo: 'Command K',
  nav: 'Sections',
  how: 'How it works',
  control: 'Your control',
  evidence: 'Evidence',
  eyebrow: 'Live on testnet · ETH → USDC',
  headingStart: 'Borrow against',
  headingEnd: 'what you hold.',
  lead: 'An agent looks after your loan while you are away. You choose the limits. Only your wallet can withdraw.',
  proofLabel: 'How your funds are controlled',
  proof: ['Agent acts inside your limits', 'Every action checked on-chain'],
  nextLabel: '01 / How it works',
  next: 'Borrow against ETH. Set a corridor. Let the agent act within it.',
  fullLanding: 'Explore the full landing',
  controlNote: 'Control stays with your wallet.',
  codeEvidence: 'Read the code and evidence',
};

// ---------------------------------------------------------------- statuses (PRD 4, D1)

export const statusOrder: Status[] = ['live', 'production', 'roadmap', 'exploring']; // PRD 4 l.72

export const statusLabel: Record<Status, string> = {
  live: 'Live on testnet', // PRD 4 l.67
  production: 'Production release', // PRD 4 l.68
  roadmap: 'Roadmap', // PRD 4 l.69
  exploring: 'Exploring', // PRD 4 l.70
};

// What each status means, for the agent file (PRD 8.1 part 2).
export const statusMeaning: Record<Status, string> = {
  live: 'Runs today on NEAR testnet and Base Sepolia, unaudited, with no real money.', // PRD 4 l.67; README l.3
  production: 'In the first production release, which follows an audit. Not available today.', // PRD 4 l.68; SCOPE l.19
  roadmap: 'Planned after the first production release. Not built.', // README l.187 (roadmap order starts with the first production release)
  exploring: 'An idea under consideration. No commitment and no date.', // D3; PRD 4 l.70
};

// ---------------------------------------------------------------- links (PRD 7)

export const links = {
  testnet: 'https://testnet.cmdk.fi', // PRD 7 l.269
  sandbox: 'https://testnet.cmdk.fi/#sandbox/start', // PRD 7 l.270; FLOW l.379; opened on the live site 10 Nov 2026
  repo: 'https://github.com/cmdkfi/app', // PRD 7 l.271
  readme: 'https://github.com/cmdkfi/app#readme', // PRD 5.8 l.190
  research: 'https://github.com/cmdkfi/app/tree/main/research', // PRD 5.11 l.213
  evidence: 'https://relayer.cmdk.fi/agent', // PRD 7 l.272
  contact: 'mailto:team@cmdk.fi', // PRD 7 l.273
  contactLabel: 'team@cmdk.fi',
  agents: '/agents',
  llms: '/llms.txt',
  llmsFull: '/llms-full.txt',
  // Prefilled-chat formats (PRD 8.3). The prompt is appended URL-encoded.
  // ChatGPT: verified 10 Nov 2026 (logged out, opened a new chat with the text filled in and sent).
  // Claude: redirects a logged-out browser to the login page with the q parameter kept in returnTo; not verified signed in.
  claudeChatPrefix: 'https://claude.ai/new?q=',
  chatgptChatPrefix: 'https://chatgpt.com/?q=',
};

// ---------------------------------------------------------------- shared lines

// Required near every primary action (PRD 4 l.86). Facts: README l.3 (testnet, unaudited); COPY l.51 (no real money).
export const testnetLine = 'Runs on NEAR testnet and Base Sepolia. Unaudited. No real money.'; // PRD 4 l.86

// App PR #89 (11 Nov): the testnet flow is desktop-only; on a phone the app offers the sandbox (MetaMask Mobile's browser fails the first signature, MetaMask/metamask-mobile#39052).
export const walletBrowserCaption = 'The testnet flow runs on a desktop browser with a wallet extension. On a phone, try the sandbox.';

export const honesty = {
  insurance: 'Protection is risk management, not insurance. A dip that recovers costs you something.', // COPY l.62
  insuranceShort: 'Protection is risk management, not insurance.', // COPY l.62
  outage: 'If NEAR, the signing network or the agent is down, your loan waits. A backstop is on our roadmap.', // COPY l.63
  compromised: 'A compromised agent can still cost you money, but only inside your corridor.', // COPY l.64
  gap: 'A price gap faster than every layer still liquidates.', // COPY l.44
};

export const cta = {
  openTestnet: 'Open testnet app', // PRD 5.1 l.101
  sandbox: 'Run a market crash in the sandbox', // PRD 5.2 l.108
  askAgent: 'Ask your agent', // PRD 5.1 l.100
};

// ---------------------------------------------------------------- features (PRD 6: 5.5–5.9 and the 5.7 grid)

export const features: Feature[] = [
  // 5.5 When the market falls
  {
    id: 'reduce-early',
    group: 'market',
    title: 'Sell early to repay debt',
    text: 'Sells a small part of the collateral early to repay debt, so the loan does not arrive at a crash close to the line.',
    status: 'live',
    source: 'README l.11, l.35',
  },
  {
    id: 'reduce-to-target',
    group: 'market',
    title: 'Back to target above the act line',
    text: 'Above the line you set, it brings the loan back to your target.',
    status: 'live',
    source: 'README l.39',
  },
  {
    id: 'buy-back',
    group: 'market',
    title: 'Buy back after a recovery',
    text: 'Buys back after a recovery, inside a ceiling and a daily budget you set.',
    status: 'production',
    source: 'README l.45; SCOPE l.11; COPY l.31',
  },
  {
    id: 'rebalance-assets',
    group: 'market',
    title: 'Rebalance across assets',
    text: 'Rebalances across assets when you hold more than one.',
    status: 'roadmap',
    source: 'README l.187',
  },

  // 5.6 When a market shows stress
  {
    id: 'migrate',
    group: 'venue-risk',
    title: 'Move to another approved market',
    text: 'Moves your loan to another market you approved, with the same collateral and the same debt (up to 0.000002 USDC of rounding), without selling.',
    status: 'live',
    source: 'COPY l.15; README l.25',
  },
  {
    id: 'exit',
    group: 'venue-risk',
    title: 'Exit the market',
    text: 'Exits the market if no approved market can take the loan, if you allowed it.',
    status: 'live',
    source: 'README l.11, l.43',
  },
  {
    id: 'cross-venue',
    group: 'venue-risk',
    title: 'Move between venues and chains',
    text: 'Moves between venues and chains: Morpho, Aave-style venues, Rhea on NEAR, Kamino on Solana.',
    status: 'roadmap',
    source: 'README l.173, l.187; SCOPE l.8',
  },
  {
    id: 'venue-caps',
    group: 'venue-risk',
    title: 'Caps per venue',
    // PRD draft said "per venue and per chain"; the sources name caps per venue only (README l.173, l.187).
    text: 'Caps per venue, so one incident reaches only part of what you hold.',
    status: 'roadmap',
    source: 'README l.173, l.187',
  },

  // 5.7 Collateral
  { id: 'eth', group: 'collateral', title: 'ETH as collateral', text: 'ETH', status: 'live', source: 'SCOPE l.7 (WETH); README l.7' },
  { id: 'btc', group: 'collateral', title: 'BTC as collateral', text: 'BTC', status: 'production', source: 'SCOPE l.7; COPY l.25' },
  {
    id: 'stocks',
    group: 'collateral',
    title: 'Tokenized stocks as collateral',
    text: 'Tokenized stocks, with deleveraging before the weekend price freeze',
    status: 'roadmap',
    source: 'README l.187; SCOPE l.7; COPY l.26',
  },
  {
    id: 'more-assets',
    group: 'collateral',
    title: 'More crypto assets',
    text: 'More crypto assets (NEAR and others)',
    status: 'roadmap',
    source: 'SCOPE l.7 ("More assets"); README l.184 (NEAR)',
  },
  { id: 'gold', group: 'collateral', title: 'Gold as collateral', text: 'Gold (tokenized)', status: 'exploring', source: 'D3' },
  {
    id: 'rwa',
    group: 'collateral',
    title: 'Real-world assets as collateral',
    text: 'Real-world assets, for example tokenized property',
    status: 'exploring',
    source: 'D3',
  },

  // 5.7 Borrow (the 5.7 "Rates" row sits here: PRD 6 has no separate rates group)
  { id: 'usdc', group: 'borrow', title: 'Borrow USDC', text: 'USDC', status: 'live', source: 'SCOPE l.8; README l.7' },
  {
    id: 'best-rate',
    group: 'borrow',
    title: 'Best rate among approved venues',
    text: 'Borrow where the rate is best among venues you approved',
    status: 'exploring',
    source: 'D3',
  },

  // 5.7 Venues
  { id: 'morpho-base', group: 'venue', title: 'Morpho on Base', text: 'Morpho on Base', status: 'live', source: 'SCOPE l.8' },
  { id: 'aave', group: 'venue', title: 'Aave-style venues', text: 'Aave-style venues', status: 'roadmap', source: 'SCOPE l.8' },
  { id: 'rhea', group: 'venue', title: 'Rhea on NEAR', text: 'Rhea on NEAR', status: 'roadmap', source: 'SCOPE l.8; COPY l.26' },
  {
    id: 'kamino',
    group: 'venue',
    title: 'Kamino on Solana',
    text: 'Kamino on Solana',
    status: 'roadmap',
    source: 'SCOPE l.8 (Solana); README l.173 (Kamino)',
  },

  // 5.7 Chains
  {
    id: 'base-near',
    group: 'chain',
    title: 'Base and NEAR',
    text: 'Base (position), NEAR (vault)',
    status: 'live',
    source: 'README l.3, l.53',
  },
  {
    id: 'any-chain',
    group: 'chain',
    title: 'Any-chain deposits and withdrawals',
    text: 'Deposit and withdraw from any chain through NEAR Intents',
    status: 'production',
    source: 'SCOPE l.9; COPY l.24',
  },
  {
    id: 'private-route',
    group: 'chain',
    title: 'Private deposit and withdrawal route',
    text: 'A private route for deposits and withdrawals (Confidential Intents)',
    status: 'production',
    source: 'SCOPE l.9; COPY l.23',
  },
  {
    id: 'more-chains',
    group: 'chain',
    title: 'Solana and more EVM chains',
    text: 'Solana, more EVM chains',
    status: 'roadmap',
    source: 'SCOPE l.8; README l.187',
  },

  // 5.8 The agent cannot move your money (wording from COPY "Say freely")
  {
    id: 'three-actions',
    group: 'control',
    title: 'Three actions, no recipient',
    text: "The agent's key can call only three actions: reduce, move, exit. None of them names a recipient.",
    status: 'live',
    source: 'COPY l.7; README l.25',
  },
  {
    id: 'owner-withdraw',
    group: 'control',
    title: 'Withdrawals need your signature',
    text: 'Money leaves only when your wallet signs a withdrawal.',
    status: 'live',
    source: 'COPY l.8',
  },
  {
    id: 'corridor',
    group: 'control',
    title: 'Acts only inside your corridor',
    text: 'The agent acts only inside your corridor: how low your LTV may go, how much it may sell per day, whether it may move your loan or exit.',
    status: 'live',
    source: 'COPY l.9; README l.37-43',
  },
  {
    id: 'onchain-check',
    group: 'control',
    title: 'Re-checked on Base',
    text: "Every action is re-checked on Base against the market's own price before anything moves.",
    status: 'live',
    source: 'COPY l.10 ("Morpho\'s own price"); README l.29',
  },
  {
    id: 'immutable-vault',
    group: 'control',
    title: 'Immutable vault',
    text: 'The vault is immutable: no admin key, no upgrade, not even ours.',
    status: 'live',
    source: 'COPY l.11; README l.89',
  },
  {
    id: 'enclave',
    group: 'control',
    title: 'Enclave checked on-chain',
    text: "The agent's code runs in a hardware enclave, and your vault checks its fingerprint on-chain before giving it a key. A new agent version needs your approval.",
    status: 'live',
    source: 'COPY l.12; README l.74',
  },
  {
    id: 'revoke',
    group: 'control',
    title: 'Revoke in one signature',
    text: 'Revoking the agent takes one signature.',
    status: 'live',
    source: 'COPY l.14; README l.140',
  },
  {
    id: 'own-wallet',
    group: 'control',
    title: 'Your existing wallet',
    text: 'You sign with the wallet you already have. No new keys.',
    status: 'live',
    source: 'COPY l.16; README l.72',
  },
  {
    id: 'smart-wallets',
    group: 'control',
    title: 'Smart wallets and passkeys',
    text: 'Smart wallets and passkeys.',
    status: 'production',
    source: 'SCOPE l.10; COPY l.27',
  },
  {
    id: 'backstop',
    group: 'control',
    title: 'Backstop',
    text: 'A backstop that works when the agent is down.',
    status: 'roadmap',
    source: 'SCOPE l.17; README l.167',
  },

  // 5.9 Strategies, later
  {
    id: 'rebalancing',
    group: 'strategy',
    title: 'Rebalancing',
    text: 'Rebalancing across assets, with caps across venues.', // README l.187 wording: "caps across venues and rebalancing across assets"
    status: 'roadmap',
    source: 'README l.173, l.187',
  },
  {
    id: 'hedged',
    group: 'strategy',
    title: 'Hedged mode',
    text: 'Hedged mode: stock collateral with a short position against it.',
    status: 'roadmap',
    source: 'SCOPE l.11; README l.187; COPY l.26',
  },
  {
    id: 'usdc-to-work',
    group: 'strategy',
    title: 'Put borrowed USDC to work',
    text: 'Putting borrowed USDC to work in a venue you approve.',
    status: 'exploring',
    source: 'D3',
  },
  {
    id: 'best-rate-routing',
    group: 'strategy',
    title: 'Best-rate routing',
    text: 'Best-rate routing for new loans.',
    status: 'exploring',
    source: 'D3',
  },
];

// Area names, used in the status table and the agent file.
export const groupLabel: Record<Group, string> = {
  market: 'When the market falls',
  'venue-risk': 'When a market shows stress',
  collateral: 'Collateral',
  borrow: 'Borrow',
  venue: 'Venues',
  chain: 'Chains',
  control: 'Control of your money',
  strategy: 'Strategies',
};

// Page order of the areas (PRD 5.5–5.9).
export const groupOrder: Group[] = ['market', 'venue-risk', 'collateral', 'borrow', 'venue', 'chain', 'control', 'strategy'];

export function featuresOf(group: Group): Feature[] {
  const list = features.filter((f) => f.group === group);
  return statusOrder.flatMap((s) => list.filter((f) => f.status === s)); // PRD 4 l.72: live, production, roadmap, exploring
}

// ---------------------------------------------------------------- page (PRD 5)

export const meta = {
  title: 'cmdk: borrow against what you hold',
  description:
    'Borrow USDC against what you hold. An AI agent keeps your loan away from liquidation while you are away, inside limits you set, and it cannot move your money. Runs on NEAR testnet and Base Sepolia. Unaudited.', // PRD 5.2; D4; COPY l.7; README l.3
  lang: 'en',
};

export const header = {
  brand: '⌘K', // PRD 5.1 l.98
  brandLabel: 'cmdk home',
  navLabel: 'Sections',
  anchors: [
    { href: '#how', label: 'How it works' },
    { href: '#assets', label: 'Assets and venues' },
    { href: '#control', label: 'Security' },
    { href: '#status', label: 'Status' },
  ], // PRD 5.1 l.99
};

export const hero = {
  id: 'top',
  h1: 'Borrow against what you hold. An agent looks after the loan, and it cannot move your money.', // PRD 5.2 l.105; COPY l.7
  // PRD draft: "Deposit crypto, and later stocks and gold, as collateral." Gold is Exploring (D3: no commitment),
  // so "later ... gold" would move it toward a plan; tightened to stocks (Roadmap, README l.187).
  sub: 'Deposit crypto, and later stocks, as collateral. Borrow USDC. An AI agent keeps your loan away from liquidation while you are away, inside limits you set.', // PRD 5.2 l.106; D4; README l.7, l.11
  sandboxCaption: 'No wallet needed. Simulated.', // PRD 5.2 l.108; FLOW l.370, l.392
  proof: [
    'The agent cannot send your money anywhere.', // COPY l.7
    // First use of "corridor", explained as "limits you set" (PRD 4 l.91). PRD draft: "It acts only inside limits you set."
    'It acts only inside your corridor, the limits you set.', // COPY l.9
    'Every action is checked on-chain before anything moves.', // COPY l.10
  ],
};

// A Light design: warm canvas, white panels, charcoal type and green accents; shared with the app.
// Presentation labels live here too; the feature inventory and machine-readable claims above stay unchanged.
export const visual = {
  brand: '⌘K cmdk',
  menu: 'Menu',
  skip: 'Skip to content',
  heroTitle: ['Borrow against', 'what you hold.'],
  heroLead: 'An agent looks after the loan. You control the limits.', // hero; COPY l.9
  heroScope: 'Borrow USDC against ETH on testnet today.', // FLOW S1; SCOPE l.7–8
  trust: [
    'Your wallet signs withdrawals', // COPY l.8
    'Actions checked on-chain', // COPY l.10
    'Live on testnet', // SCOPE
  ],
  preview: {
    label: 'Illustrative position · testnet',
    title: 'Your loan, within your limits.',
    collateral: 'ETH',
    borrow: 'USDC',
    ltv: 'LTV: debt as a share of collateral value.', // COPY l.55
    description: 'Example LTV corridor: target 50%, act above 70%, liquidation at 86%.', // FLOW S2 example
    markers: [
      { label: 'Target', value: '50%', position: 50 / 86 * 100, kind: 'target' },
      { label: 'Act above', value: '70%', position: 70 / 86 * 100, kind: 'act' },
      { label: 'Liquidation', value: '86%', position: 100, kind: 'liquidation' },
    ],
    steps: ['Price falls', 'Agent repays part of the debt', 'Loan returns toward target'], // market reduce-early, reduce-to-target
    note: 'Example only. Actions depend on your limits.',
  },
  responses: 'Two risks. Two responses.',
  marketTitle: 'When prices fall',
  marketSub: 'Sell part of the collateral to repay debt.', // reduce-early
  venueTitle: 'When a market shows stress',
  venueSub: 'Move the loan between approved markets.', // migrate
  venueNodes: ['Approved market A', 'Approved market B'],
  venueNote: 'Same collateral. Same debt, to 0.000002 USDC. Cross-venue moves are roadmap.', // migrate; cross-venue
  marketDetails: 'Explore price protection',
  venueDetails: 'Explore market migration',
  problemDetails: 'Why a loan needs looking after',
  chart: {
    label: 'Illustrative loan-to-value rises above the action line, then falls toward the target. Not a forecast.',
    note: 'Illustrative, not a forecast.',
    axis: 'LTV',
    time: 'Time',
    values: ['86%', '70%', '50%'],
  },
  controlTitle: ['An agent with limits.', 'A wallet only you control.'],
  permissions: [
    { label: 'Agent can', value: 'Reduce · Move · Exit' }, // three-actions
    { label: 'You set', value: 'Limits and permissions' }, // corridor
    { label: 'Only you', value: 'Sign withdrawals' }, // owner-withdraw
  ],
  controlDetails: 'Read the full control model',
  howTitle: 'What you can try today.',
  steps: [
    { title: 'Choose', text: 'Choose an amount of ETH on testnet.' }, // FLOW S1
    { title: 'Sign', text: 'Review the limits and sign with your wallet.' }, // FLOW S2–S4
    { title: 'Monitor', text: 'Review the loan and the agent’s actions.' }, // FLOW S5
  ],
  researchLabel: 'Evidence, with its limits',
  researchCards: [
    { eyebrow: 'Historical replay · simulated', title: 'The buffer matters.' },
    { eyebrow: 'Venue stress replay', title: 'Earlier signals, not guarantees.' },
  ],
  researchDetails: 'Read the research scope and caveats',
  assetsTitle: 'Today, and what comes next.',
  assetsIntro: 'Every asset, market and capability has a status. Only “Live on testnet” exists today.',
  assetsDetails: 'Explore all assets and venues',
  strategyDetails: 'Explore future strategies',
  directoryTitle: 'The complete feature directory',
  directoryIntro: 'Live means testnet only. Production release is not available today and follows an audit. Exploring means no commitment.', // statusMeaning
  directorySearch: 'Find an asset, market or feature',
  directoryFilter: 'Filter features by status',
  all: 'All',
  noResults: 'No matching features. Try another search or status.',
  results: 'features shown',
  limitsTitle: 'Know the limits.',
};

export const commandMenu = {
  title: 'Where would you like to go?',
  label: 'Quick navigation',
  macShortcut: '⌘ K',
  otherShortcut: 'Ctrl K',
  close: 'Close',
  hint: 'Tab to move · Enter to open · Esc to close',
  sections: 'Explore cmdk',
};

export const problem = {
  id: 'problem',
  h2: 'DeFi risk is more than one person can watch.', // PRD 5.3 l.116
  blocks: [
    {
      title: 'Prices fall while you sleep.',
      text: 'A liquidation sells most of your collateral at the bottom.', // README l.18
      // README l.144
      facts: [
        "About 3,300 borrowers of Coinbase's Morpho-powered loans were liquidated in one week of February 2026.", // README l.144
        'About $394M was liquidated on the Base cbBTC/USDC market between November 2025 and July 2026.', // README l.144
      ],
    },
    {
      title: 'Venues have bad days.',
      // README l.78 (oracle incident), l.47 (utilization, rate and liquidity screens); INCIDENTS l.96-103 (oracle, freeze, pause incidents)
      // PRD draft also had "You find out after it matters." No source; left out (see report).
      text: 'Rates spike, liquidity dries up, an oracle misbehaves.',
      facts: [],
    },
    {
      title: 'Too many places.',
      // VENUES l.12: 16,164 DefiLlama lending pools scanned; Aave V3 24 markets, Kamino 48 markets.
      text: 'Hundreds of lending markets on many chains, each with its own rates and rules. Watching them is a job.',
      facts: [],
    },
  ],
  // The team's research notes on borrower reports (internal): the ~3,300 borrowers were liquidated
  // "despite alerts 'up to every 30 minutes'". Restored by the founder, 10 Nov 2026.
  closing: 'Alerts tell you. They do not act.', // PRD 5.3
};

export const forWhom = {
  id: 'for',
  h2: 'For people who hold and do not plan to sell.', // PRD 5.4 l.124; README l.144 ("borrow against crypto they want to keep")
  body: 'If you intend to keep your ETH, BTC or stocks for years, selling to get cash means giving up the position. Borrowing against it keeps the position, but a loan needs looking after every day. cmdk is the tool that does the looking after.', // PRD 5.4 l.125
  yourPart: 'You choose the asset, the amount and the limits. You keep the only key that can withdraw.', // PRD 5.4 l.126; COPY l.8
};

export const market = {
  id: 'market',
  h2: 'When the market falls, the agent adjusts the loan.', // PRD 5.5 l.129
  evidenceLabel: 'Evidence',
  evidence: [
    // README l.20: 1,890 of 1,895 before 2026 + 5,009 of 5,011 in 2026 = 6,899 of 6,906, so all but 7; COPY l.34
    'Simulated: across 20,479 real Morpho liquidations, the corridor avoids all but 7 of 6,906 for positions above $1,000.',
    // README l.18; COPY l.35
    'Simulated: in a fall from $100k to $55k, a liquidated 0.1 BTC loan keeps 0.01 BTC; a plain rule inside the corridor keeps about 0.059.',
    // README l.18: 0.01 of 0.1 BTC kept is about 90% lost; 0.059 of 0.1 is more than half kept.
    'In that simulated fall, the liquidated loan loses about 90% of its BTC; inside the corridor it keeps more than half.',
    // README l.20, l.35; COPY l.33
    'What saved positions on 10 October 2025 was the buffer built days earlier, not speed.',
  ],
  honesty: honesty.insurance, // COPY l.62
  link: { label: 'See it in the sandbox', href: links.sandbox }, // PRD 5.5 l.140
};

export const venue = {
  id: 'venue',
  h2: 'When a market shows stress, the agent moves the loan.', // PRD 5.6 l.143
  evidenceLabel: 'Evidence',
  evidence: [
    // README l.47 (6 of 8 for the model and for numeric rules, earlier in 5), l.156 (supplier and depositor positions); COPY l.36, l.38
    // Timing: README l.47 (earlier in 5 of the 6; 136 minutes versus 25 in the widest case counted in minutes); COPY l.36.
    "On venue stress in 8 real incidents (tested on suppliers and depositors), the agent's AI exited in time in 6, as did simple rules, but it warned earlier in 5 of them: more than 2 hours before one lock-up, where rules gave 25 minutes.",
    // README l.47: in the price scenes "the numeric screens did that work"; the model gets "text a rule cannot read"
    // and its contribution is the venue-stress move and the earlier exits. Never "the AI catches more" (COPY l.36, l.49).
    'For price falls, plain rules inside your corridor do the work. The AI earns its place on venue stress, where it reads text a rule cannot read, such as status feeds today and news in later releases, and can act earlier.',
  ],
  // PRD draft: "No tool protects you from a bug in a lending protocol." The source claims this for cmdk only
  // (README l.96, "Not claimed: Protection from venue bugs"); narrowed to cmdk.
  limit:
    'cmdk does not protect you from a bug in a lending protocol. Spreading across venues limits how much sits in one place.', // README l.96; PRD 4 l.83
};

export const assets = {
  id: 'assets',
  h2: 'One vault for what you hold, wherever the best market is.', // PRD 5.7 l.153
  grids: ['collateral', 'borrow', 'venue', 'chain'] as Group[],
  note: 'Live means the testnet build: ETH is deposited as WETH on Base Sepolia.', // PRD 5.7 l.175; SCOPE l.7
};

export const control = {
  id: 'control',
  h2: 'The agent can save your loan. It cannot move your money.', // PRD 5.8 l.178
  // LTV explained once on the page (PRD 4 l.91; COPY l.55). The control list is its first use.
  ltvNote: 'LTV is how much you owe versus what your collateral is worth.',
  honesty: honesty.compromised, // COPY l.64
  link: { label: 'Read the security model and its limits', href: links.readme }, // PRD 5.8 l.190; README l.80-96
};

export const strategies = {
  id: 'strategies',
  h2: 'More than protection, later.', // PRD 5.9 l.193
  intro: 'Nothing in this section exists yet.', // PRD 5.9 l.194
};

export const how = {
  id: 'how',
  h2: 'Three steps.', // PRD 5.10 l.202
  steps: [
    { title: 'Choose.', text: 'Pick the asset, the amount and your limits.' }, // PRD 5.10 l.203
    {
      title: 'Sign.',
      text: 'Sign with your own wallet. Your vault opens the loan and the USDC arrives in your wallet.', // COPY l.16; FLOW l.69 (D2); README l.7
    },
    {
      title: 'Leave it.',
      text: 'The agent checks the loan and the market around the clock and acts inside your limits. You can close or revoke at any time.', // README l.11, l.103
    },
  ],
  caption: 'On testnet today: ETH to USDC on Morpho with preset limits, two transactions and three signatures for a fresh open.', // FLOW l.194 (wallet without WETH); FLOW S2 (settings are read-only in the guided flow)
};

export const proof = {
  id: 'proof',
  h2: 'Check it yourself.', // PRD 5.11 l.210
  links: [
    { label: 'The code', href: links.repo, line: 'Vault, executor and agent, MIT license.' }, // README l.204, l.214-216
    {
      label: 'The research and the data',
      href: links.research,
      line: 'Liquidation backtest and dataset, incident replay, venue coverage, costs.', // PRD 3 l.53 (research directories)
    },
    {
      label: "The agent's evidence",
      href: links.evidence,
      line: "The enclave's measurement files and the agent's decision transcripts.", // README l.136
    },
    { label: 'The testnet app', href: links.testnet, line: 'ETH to USDC on Morpho, on Base Sepolia.' }, // FLOW l.16
  ],
  builtOn: 'Built on NEAR: Chain Signatures, Global Contracts, function-call keys, NEAR AI Cloud.', // COPY l.17
};

export const statusSection = {
  id: 'status',
  h2: 'What exists today, and what comes next.', // PRD 5.12 l.219
  columns: { item: 'Item', area: 'Area', status: 'Status' },
  caption: 'Every item on this page, by status.',
  footnote: 'Unaudited. The first production release follows an audit.', // PRD 5.12 l.221; SCOPE l.19
};

export const limits = {
  id: 'limits',
  h2: 'What cmdk does not do.', // PRD 5.13 l.224
  honesty: [honesty.insurance, honesty.outage, honesty.compromised, honesty.gap], // COPY l.62, l.63, l.64, l.44
  faqHeading: 'Questions',
  faq: [
    {
      q: 'Can the agent take my funds?',
      a: "No. Its key can call only three actions, none of which names a recipient; everything it does pays back into your own loan. Money leaves only when your wallet signs a withdrawal.", // COPY l.7, l.8
    },
    {
      q: 'What can the agent do without asking me?',
      a: 'Inside your corridor: sell part of the collateral to repay debt, move the loan to another market you approved, or exit the market if you allowed it. It cannot increase your debt on this venue, apart from up to 0.000002 USDC of rounding when it moves the loan.', // README l.11, l.25, l.43; FLOW l.49 (fact 7 wording)
    },
    {
      q: 'What happens if the agent is offline?',
      a: honesty.outage, // COPY l.63
    },
    {
      q: 'Is this live with real money?',
      a: 'No. Testnet only; unaudited.', // PRD 5.13 l.234; README l.3
    },
    {
      q: 'Which assets and venues work today?',
      a: 'ETH, deposited as WETH on Base Sepolia, as collateral; USDC to borrow; Morpho on Base. Everything else is marked with its status.', // SCOPE l.7, l.8
    },
    {
      q: 'What does it cost?',
      a: 'Pricing is not decided. The testnet build charges no fees.', // README l.144; SCOPE l.18
    },
    {
      q: 'Is my position private?',
      a: 'Not in the testnet build: positions are public. A private funding route is in the first production release.', // COPY l.48; README l.157; SCOPE l.9
    },
    {
      q: 'Can I run the agent myself?',
      a: 'Documented, command line.', // COPY l.28; SCOPE l.12
    },
  ],
};

export const agentSection = {
  id: 'agent',
  h2: 'Prefer to ask?', // PRD 8.3 l.319
  text: 'Give your AI assistant the full description of cmdk and let it explain.', // PRD 8.3 l.312
  button: cta.askAgent,
};

export const finalAction = {
  id: 'try',
  h2: 'Try it without money.', // PRD 5.15 l.244
};

export const footer = {
  brand: '⌘K cmdk', // PRD 5.15 l.245
  linksLabel: 'Footer',
  links: [
    { label: 'Testnet app', href: links.testnet },
    { label: 'GitHub', href: links.repo },
    { label: links.contactLabel, href: links.contact },
    { label: cta.askAgent, href: links.agents, agent: true },
    { label: '/llms.txt', href: links.llms },
  ],
  insurance: honesty.insuranceShort, // COPY l.62
  copyright: '© 2026 cmdk', // PRD 5.15 l.245
};

// ---------------------------------------------------------------- Ask your agent (PRD 8)

// PRD 8.2 l.302. One constant, used by every button.
export const prompt =
  'Read https://cmdk.fi/llms-full.txt and explain cmdk to me in plain words: what it does, who it is for, and how the agent is limited. Separate clearly what is live on testnet today from what is planned. List the main risks. Tell me how I can try it without money. Then ask me what I hold and what I want to know more about.';

export const agentPanel = {
  heading: 'Ask your agent',
  intro: 'Give your AI assistant the full description of cmdk and let it explain.', // PRD 8.3 l.312
  claude: 'Open in Claude', // PRD 8.3 l.313
  chatgpt: 'Open in ChatGPT', // PRD 8.3 l.314
  copyPrompt: 'Copy prompt', // PRD 8.3 l.315
  copyPromptFor: 'For Claude Code, Codex or any other agent.', // PRD 8.3 l.315
  promptLabel: 'The prompt',
  copyFull: 'Copy the full text', // PRD 8.3 l.316
  copyFullFor: 'For assistants that cannot open links.', // PRD 8.3 l.316
  fullLink: '/llms-full.txt',
  copied: 'Copied', // PRD 8.3 l.315
  copyFailed: 'Could not copy. Select the text and copy it by hand.',
  note: "Your assistant's answer is its own. The file states what is live and what is planned; check anything important against it.", // PRD 8.3 l.317
  close: 'Close',
  newTab: '(opens in a new tab)',
};

export const agentBar = {
  text: 'Too much to read? Ask your agent to explain it.', // PRD 8.3 l.306
  button: 'Show me how', // PRD 8.3 l.306
  close: 'Close',
  storageKey: 'cmdk.agentbar.dismissed', // PRD 8.3 l.308
};

export const agentsPage = {
  title: 'Ask your agent about cmdk',
  description: 'Hand the full description of cmdk to your own AI assistant and let it explain.',
  back: 'Back to cmdk.fi',
};

// ---------------------------------------------------------------- agent files (PRD 8.1)

export const agentDoc = {
  title: 'cmdk',
  // Part 1: what cmdk is, three sentences.
  summary: [
    'cmdk lets you borrow USDC against what you hold, and an AI agent looks after the loan inside limits you set.', // PRD 5.2; README l.7, l.11
    'The agent keeps your loan away from liquidation while you are away, and it cannot move your money: its key can call only three actions, none of which names a recipient, and money leaves only when your wallet signs a withdrawal.', // D4; COPY l.7, l.8
    'It is for people who hold an asset, do not plan to sell it, and would rather borrow against it.', // PRD 5.4; README l.144
  ],
  // llms.txt one-paragraph summary.
  short:
    'cmdk lets you borrow USDC against what you hold. An AI agent keeps the loan away from liquidation while you are away, inside limits you set, and it cannot move your money. Every feature in llms-full.txt carries its status: Live on testnet, Production release, Roadmap or Exploring.', // PRD 5.2; D4; COPY l.7; PRD 4
  llmsLinks: {
    full: 'The whole product in one file: what is live, what is planned, limits, risks, FAQ.',
    testnet: 'The testnet app (Base Sepolia; a desktop browser with a wallet extension; on a phone, the sandbox).', // cmdkfi/cmdk-app PR #89: desktop-only testnet flow, sandbox on phones
    repo: 'Code, research and evidence (MIT).', // README l.204
  },
  headings: {
    readThis: 'How to read this file',
    howItWorks: 'How it works',
    agent: 'What the agent can do, and what it cannot do',
    features: 'Every feature, with its status',
    evidence: 'Evidence',
    limits: 'Limits and risks',
    faq: 'FAQ',
    tryIt: 'How to try it',
    links: 'Links',
    instructions: 'Instructions for an assistant reading this',
  },
  readThis:
    'Every feature, asset, venue and chain has exactly one status, written in brackets at the start of its line. Only items marked [Live on testnet] exist today.', // PRD 4 l.63
  // Part 3: how it works, end to end.
  howItWorks: [
    'Your wallet: you sign with the wallet you already have; it is the owner of your vault. No new keys.', // COPY l.16; README l.72
    'The vault: one contract per user on NEAR, immutable: no admin key, no upgrade, not even ours.', // COPY l.11; README l.53
    "The position address: an address on Base that only your vault can sign for, through NEAR Chain Signatures. Your collateral and loan sit there, on Morpho Blue.", // README l.53, l.72; FLOW l.30
    "The agent: its code runs in a hardware enclave (Intel TDX), and your vault checks its fingerprint on-chain before giving it a key. A new agent version needs your approval.", // COPY l.12
    "The checks: every action is re-checked on Base against Morpho's own price before anything moves; a swap may not fill more than 1% below that price.", // COPY l.10
    'Money leaves only when your wallet signs a withdrawal.', // COPY l.8
  ],
  // Part 4.
  agentCan: [
    'reduce: sell part of the collateral to repay debt, early in calm times or back to your target above the line you set.', // README l.25, l.35, l.39
    'move (migrate): move the loan to another market you approved, with the same collateral and the same debt (up to 0.000002 USDC of rounding), without selling.', // COPY l.15; README l.25
    'exit: repay everything and take the collateral out of the market, if you allowed it.', // README l.25, l.43
  ],
  agentCanIntro: 'The agent acts only inside your corridor (limits you set: how low your LTV may go, how much it may sell per day, whether it may move your loan or exit). LTV means how much you owe versus what your collateral is worth. Its key can call three actions:', // COPY l.9, l.55; PRD 4 l.91
  agentCannot: [
    'It cannot send your money anywhere: none of its actions names a recipient, and everything it does pays back into your own loan.', // COPY l.7
    'It cannot increase your debt on this venue, apart from up to 0.000002 USDC of rounding when it moves the loan.', // README l.25, l.49 (up to two loan-token units of rounding)
    'A sale is sized at the oracle price not to go below the floor you set; a fill better than the oracle can end a few hundredths of a point under it. An exit, if you allowed it, repays all debt and is not sized by the floor.', // README l.49
    'It cannot act more than 10 minutes after you revoke it; revoking takes one signature.', // COPY l.14
  ],
  limitsExtra: [
    'cmdk does not claim enclave or RPC availability, or diversification until a second venue ships.', // README l.96 ("Not claimed"); venue bugs are covered by venue.limit above
    'Unaudited. The first production release follows an audit.', // SCOPE l.19
    'Not private in the testnet build: positions and the owner-to-position link are public.', // COPY l.48; README l.157
  ],
  // Part 9.
  tryIt: [
    'Open the testnet app with a browser wallet (for example MetaMask or Rabby) on Base Sepolia and some Base Sepolia ETH. On a phone the testnet flow is not offered; the app shows the sandbox instead (inside MetaMask Mobile’s browser the first signature fails: MetaMask/metamask-mobile#39052). Testnet ETH is free from public faucets.', // FLOW l.86, l.162, l.170; cmdkfi/cmdk-app PR #85 (mobile rehearsal pending)
    'Or run a market crash in the sandbox: no wallet needed; a simulated wallet and a simulated protocol, nothing touches Base Sepolia or NEAR. The sandbox works on desktop and mobile.', // FLOW l.370, l.392; cmdkfi/cmdk-app PR #85 (responsive sandbox)
  ],
  // Part 11.
  instructions: [
    'Explain cmdk in plain words, without jargon the reader has not asked for.',
    'Always say which parts are live on testnet today and which are planned (Production release, Roadmap) or only being explored.',
    'Do not describe a planned or exploring feature as available.',
    'Mention that the code is unaudited and runs on testnet only, with no real money.',
    'Do not add benefits or claims that are not stated in this file (for example about tax).', // founder, 10 Nov 2026: an assistant added a tax benefit
    'Tell the reader how to try it without money: the testnet app and the sandbox.',
    'Do not give financial advice.',
  ], // PRD 8.1 l.294
};
