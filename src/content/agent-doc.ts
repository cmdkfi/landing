// Builds /llms-full.txt and /llms.txt from landing.ts (PRD 8.1), so the agent files cannot drift from the page.
// No copy here: every sentence comes from landing.ts. This file only arranges it.
import {
  SITE_ORIGIN,
  agentDoc,
  agentPanel,
  featuresOf,
  groupLabel,
  groupOrder,
  honesty,
  limits,
  links,
  market,
  proof,
  statusLabel,
  statusMeaning,
  statusOrder,
  testnetLine,
  venue,
  cta,
  type Feature,
} from './landing.ts';

const abs = (href: string) => (href.startsWith('/') ? SITE_ORIGIN + href : href);
const end = (s: string) => (/[.!?]$/.test(s) ? s : s + '.');

// One feature per line, status first and on the same line (PRD 8.1 part 5).
// Section items are full sentences; grid items (collateral, borrow, venues, chains) are names, so the area leads.
const GRID = new Set(['collateral', 'borrow', 'venue', 'chain']);
function featureLine(f: Feature): string {
  const area = groupLabel[f.group];
  const lead = GRID.has(f.group) && !f.text.startsWith(area) ? `${area}: ` : '';
  const body = lead + end(f.text);
  return `- [${statusLabel[f.status]}] ${body}`;
}

export function llmsFull(): string {
  const h = agentDoc.headings;
  const out: string[] = [];
  const add = (...lines: string[]) => out.push(...lines);

  // 1. What cmdk is, and the testnet line.
  add(`# ${agentDoc.title}`, '', agentDoc.summary.join(' '), '', testnetLine, '');

  // 2. How to read this file.
  add(`## ${h.readThis}`, '', agentDoc.readThis, '');
  for (const s of statusOrder) add(`- [${statusLabel[s]}] ${statusMeaning[s]}`);
  add('');

  // 3. How it works, end to end.
  add(`## ${h.howItWorks}`, '');
  for (const l of agentDoc.howItWorks) add(`- ${l}`);
  add('');

  // 4. What the agent can do, and what it cannot do.
  add(`## ${h.agent}`, '', agentDoc.agentCanIntro, '');
  for (const l of agentDoc.agentCan) add(`- ${l}`);
  add('');
  for (const l of agentDoc.agentCannot) add(`- ${l}`);
  add('');

  // 5. Every feature, one line each, status on the same line.
  add(`## ${h.features}`, '');
  for (const g of groupOrder) {
    add(`### ${groupLabel[g]}`, '');
    for (const f of featuresOf(g)) add(featureLine(f));
    add('');
  }

  // 6. Evidence, with the required wording.
  add(`## ${h.evidence}`, '');
  for (const l of [...market.evidence, ...venue.evidence]) add(`- ${l}`);
  add('');

  // 7. Limits and risks: all honesty lines and the "Not claimed" row.
  add(`## ${h.limits}`, '');
  for (const l of [...limits.honesty, venue.limit, ...agentDoc.limitsExtra]) add(`- ${l}`);
  add('');

  // 8. FAQ.
  add(`## ${h.faq}`, '');
  for (const item of limits.faq) add(`### ${item.q}`, '', item.a, '');

  // 9. How to try it.
  add(`## ${h.tryIt}`, '');
  for (const l of agentDoc.tryIt) add(`- ${l}`);
  add('', testnetLine, '');

  // 10. Links.
  add(`## ${h.links}`, '');
  add(`- ${cta.openTestnet}: ${links.testnet}`);
  add(`- ${cta.sandbox}: ${links.sandbox}`);
  for (const l of proof.links) if (l.href !== links.testnet) add(`- ${l.label}: ${abs(l.href)}`);
  add(`- ${agentPanel.heading}: ${abs(links.agents)}`);
  add(`- ${links.contactLabel}: ${links.contact}`);
  add('');

  // 11. Instructions for an assistant reading this.
  add(`## ${h.instructions}`, '');
  for (const l of agentDoc.instructions) add(`- ${l}`);
  add('', honesty.insuranceShort, '');

  return out.join('\n');
}

// Short index per the llms.txt convention: title, summary, links.
export function llmsIndex(): string {
  return [
    `# ${agentDoc.title}`,
    '',
    `> ${agentDoc.short}`,
    '',
    testnetLine,
    '',
    `## ${agentDoc.headings.links}`,
    '',
    `- [llms-full.txt](${abs(links.llmsFull)}): ${agentDoc.llmsLinks.full}`,
    `- [${cta.openTestnet}](${links.testnet}): ${agentDoc.llmsLinks.testnet}`,
    `- [${proof.links[0].label}](${links.repo}): ${agentDoc.llmsLinks.repo}`,
    '',
  ].join('\n');
}
