#!/usr/bin/env node
// Checks for the cmdk.fi landing (docs/prd-landing.md section 10). Run after `pnpm build`:
//   pnpm check            (node --experimental-strip-types scripts/check-copy.mjs)
//   pnpm check --offline  (skips the network step with a printed warning)
// Prints `file:line [rule] CHECK|ok|ok(allowed) text` like the team's internal copy check. Exit 1 on any CHECK.
//
// 1. copy rules on dist/llms-full.txt and dist/llms.txt (rule table ported from the team's internal copy check,
//    plus the landing rules of PRD 10)
// 2. page matches data: every feature text and its chip in dist/index.html; every item once in the status table
// 3. links: in-page anchors have targets; every external URL in src/content/landing.ts answers 200
// 4. indexing: noindex meta on index.html and agents.html; robots.txt allows /; _headers present and complete
// 5. size: dist/llms-full.txt under 25 KB
// 6. weight (PRD 11): HTML and CSS under 100 KB, script under 5 KB
// 7. no copy in components (PRD 12 criterion 10): .astro files under src/ hold no literal text
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const offline = process.argv.includes('--offline');
const rows = [];
const notes = [];
const rel = (p) => relative(root, p);

function mark(file, line, rule, status, text) {
  rows.push({ file, line, rule, status, text: String(text).replace(/\s+/g, ' ').trim().slice(0, 140) });
}
const check = (file, line, rule, text) => mark(file, line, rule, 'CHECK', text);
const ok = (file, line, rule, text) => mark(file, line, rule, 'ok', text);
const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);

// ---------------------------------------------------------------- 1. copy rules
// name ; phrase regex (case-insensitive) ; label regex that clears the line (empty = never cleared)
// Lines 14-25: verbatim from the team's internal copy check. Lines after: landing rules, PRD 10 item 1.
const RULES = `
buy-back;buy.?back|relever;production
four-actions;four (named |agent )?(methods|actions);
btc;\\bBTC\\b|cbBTC|bitcoin;production|simulat|liquidat|market
any-chain;any chain|other chains|NEAR Intents|1Click|Confidential Intents|private deposit;production|roadmap|no testnet|trust|never through|mainnet
smart-wallet;smart wallet|EIP-1271|passkey;production|not supported
roadmap;\\bSolana\\b|tokenized stocks|hedged mode;roadmap|next|vision
replay-20;20 of 20|all 20;simulat
replay-cohort;6,899|6,906|20,479;simulat
incident-6of8;6 of 8|6/8;simple rules|same as|rules
own-agent;run your own agent;documented|command line|compose
never;never get liquidated|liquidation-proof|risk-free|\\binsured\\b|\\btrustless\\b;brief|idea|never say|not
audited;\\baudited\\b;unaudited|not audited|Chain Signatures|PreLiquidation|follows
yield-figure;\\b(yield|APY|returns?)\\b\\W{0,3}[\\d%$]|[\\d%][\\d.,%]*\\s*\\b(yield|APY|returns?)\\b;
landing-never;\\bdegen\\b|DeFAI|set[ -]and[ -]forget|autonomous wealth|don['’]?t care|do not care|risk-free|guaranteed;
`
  .trim()
  .split('\n')
  .map((l) => {
    const [name, phrase, label] = l.split(';');
    return { name, phrase: new RegExp(phrase, 'i'), label: label ? new RegExp(label, 'i') : null };
  });

// tasks/check-copy.allow: one distinctive substring per line of a reviewed fact line (the founder adds them).
const allow = (read(join(root, 'tasks/check-copy.allow')) || '')
  .split('\n')
  .map((s) => s.trim())
  .filter(Boolean);

for (const f of ['llms-full.txt', 'llms.txt']) {
  const p = join(dist, f);
  const text = read(p);
  if (text === null) {
    check(rel(p), 0, 'copy-rules', 'file missing; run pnpm build');
    continue;
  }
  text.split('\n').forEach((line, i) => {
    for (const r of RULES) {
      if (!r.phrase.test(line)) continue;
      if (r.label && r.label.test(line)) mark(rel(p), i + 1, r.name, 'ok', line);
      else if (allow.some((a) => line.trim().includes(a))) mark(rel(p), i + 1, r.name, 'ok(allowed)', line);
      else check(rel(p), i + 1, r.name, line);
    }
  });
}

// ---------------------------------------------------------------- shared: data and pages
const data = await import(join(root, 'src/content/landing.ts'));
const { features, statusLabel, statusOrder } = data;

const decode = (s) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
const plain = (html) => decode(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
const count = (hay, needle) => hay.split(needle).length - 1;
const lineOf = (hay, idx) => hay.slice(0, idx).split('\n').length;

const indexPath = join(dist, 'index.html');
const agentsPath = join(dist, 'agents.html');
const index = read(indexPath);
const agents = read(agentsPath);

// ---------------------------------------------------------------- 2. page matches data
if (index === null) {
  check(rel(indexPath), 0, 'page-data', 'file missing; run pnpm build');
} else {
  const f0 = rel(indexPath);
  for (const f of features) {
    const attr = `data-feature="${f.id}"`;
    const n = count(index, attr);
    if (n !== 1) {
      check(f0, 0, 'page-data', `${f.id}: ${n} section items (want 1)`);
    } else {
      const at = index.indexOf(attr);
      const end = index.indexOf('</li>', at);
      const block = index.slice(at, end);
      const txt = plain('<x ' + block);
      const chips = count(block, 'data-chip=');
      const problems = [];
      if (!txt.includes(f.text)) problems.push('text not found');
      if (chips !== 1) problems.push(`${chips} chips`);
      if (!block.includes(`data-chip="${f.status}"`) || !txt.includes(statusLabel[f.status]))
        problems.push(`chip is not "${statusLabel[f.status]}"`);
      if (problems.length) check(f0, lineOf(index, at), 'page-data', `${f.id}: ${problems.join(', ')}`);
      else ok(f0, lineOf(index, at), 'page-data', `${f.id} [${statusLabel[f.status]}] ${f.text}`);
    }
    const rowAttr = `data-status-row="${f.id}"`;
    const r = count(index, rowAttr);
    if (r !== 1) check(f0, 0, 'status-table', `${f.id}: ${r} rows (want 1)`);
    else {
      const at = index.indexOf(rowAttr);
      const row = index.slice(at, index.indexOf('</tr>', at));
      if (!row.includes(`data-chip="${f.status}"`)) check(f0, lineOf(index, at), 'status-table', `${f.id}: wrong status`);
    }
  }
  // Unknown ids on the page.
  const known = new Set(features.map((f) => f.id));
  for (const m of index.matchAll(/data-(?:feature|status-row)="([^"]+)"/g))
    if (!known.has(m[1])) check(f0, lineOf(index, m.index), 'page-data', `unknown item ${m[1]}`);
  // Status table order: live, production, roadmap, exploring.
  const seq = [...index.matchAll(/data-status-row="([^"]+)"/g)].map((m) => features.find((f) => f.id === m[1])?.status);
  const ranks = seq.map((s) => statusOrder.indexOf(s));
  const sorted = ranks.every((v, i) => i === 0 || v >= ranks[i - 1]);
  if (!sorted) check(f0, 0, 'status-table', 'rows are not grouped live, production, roadmap, exploring');
  else ok(f0, 0, 'status-table', `${seq.length} rows in status order`);
}

// ---------------------------------------------------------------- 3. links
const ids = new Set(index ? [...index.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]) : []);
for (const [p, html] of [
  [indexPath, index],
  [agentsPath, agents],
]) {
  if (html === null) {
    check(rel(p), 0, 'links', 'file missing; run pnpm build');
    continue;
  }
  for (const m of html.matchAll(/href="([^"]*)"/g)) {
    const href = m[1];
    const line = lineOf(html, m.index);
    let target = null;
    if (href.startsWith('#')) target = p === indexPath ? href.slice(1) : null;
    else if (href.startsWith('/#')) target = href.slice(2);
    if (href.startsWith('#') && p !== indexPath) {
      const own = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((x) => x[1]));
      if (!own.has(href.slice(1))) check(rel(p), line, 'anchor', href);
      continue;
    }
    if (target !== null) {
      if (!ids.has(target)) check(rel(p), line, 'anchor', `${href} has no target`);
      continue;
    }
    if (href.startsWith('/') && !href.startsWith('//')) {
      const clean = href.split(/[?#]/)[0];
      const candidates = clean === '/' ? ['index.html'] : [clean.slice(1), clean.slice(1) + '.html'];
      if (!candidates.some((c) => existsSync(join(dist, c)) && statSync(join(dist, c)).isFile()))
        check(rel(p), line, 'internal-link', `${href} not in dist`);
    }
  }
}
ok('dist', 0, 'anchor', `${ids.size} ids on index.html; anchors and internal links checked`);

const landingSrc = readFileSync(join(root, 'src/content/landing.ts'), 'utf8');
const urls = new Map();
landingSrc.split('\n').forEach((l, i) => {
  for (const m of l.matchAll(/https?:\/\/[^\s'"`)<>]+/g)) {
    const u = m[0].replace(/[.,;]+$/, '');
    if (!urls.has(u)) urls.set(u, i + 1);
  }
});
const srcRel = 'src/content/landing.ts';
const toFetch = [];
for (const [u, line] of urls) {
  if (/\?q=$/.test(u)) {
    notes.push(`${srcRel}:${line} prefilled-chat prefix ${u}: not fetched (checked by hand, PRD 8.3)`);
    continue;
  }
  if (u.startsWith(data.SITE_ORIGIN + '/')) {
    const path = new URL(u).pathname.slice(1);
    if (existsSync(join(dist, path))) ok(srcRel, line, 'own-url', `${u} -> dist/${path}`);
    else check(srcRel, line, 'own-url', `${u}: dist/${path} missing`);
    continue;
  }
  if (u === data.SITE_ORIGIN) continue;
  toFetch.push([u, line]);
}
if (offline) {
  notes.push(`WARNING network step skipped (--offline): ${toFetch.length} external URLs not checked`);
} else {
  const results = await Promise.all(
    toFetch.map(async ([u, line]) => {
      const url = u.split('#')[0];
      try {
        const res = await fetch(url, {
          redirect: 'follow',
          signal: AbortSignal.timeout(15000),
          headers: { 'user-agent': 'cmdk-landing-link-check' },
        });
        return { u, line, status: res.status };
      } catch (e) {
        return { u, line, error: e.cause?.code || e.name || String(e) };
      }
    }),
  );
  if (results.length && results.every((r) => r.error)) {
    notes.push(`WARNING network step skipped: no external URL answered (offline?): ${results[0].error}`);
  } else {
    for (const r of results) {
      if (r.status === 200) ok(srcRel, r.line, 'url-200', r.u);
      else check(srcRel, r.line, 'url-200', `${r.u} -> ${r.status ?? r.error}`);
    }
  }
}

// ---------------------------------------------------------------- 4. indexing
const noindex = /<meta name="robots" content="noindex"\s*\/?>/;
for (const [p, html] of [
  [indexPath, index],
  [agentsPath, agents],
]) {
  if (html === null) continue; // reported above
  if (noindex.test(html)) ok(rel(p), 0, 'noindex', 'meta robots noindex');
  else check(rel(p), 0, 'noindex', 'meta robots noindex missing');
}
const robots = read(join(dist, 'robots.txt'));
if (robots === null) check('dist/robots.txt', 0, 'robots', 'missing');
else if (/^\s*Allow:\s*\/\s*$/im.test(robots) && !/^\s*Disallow:\s*\/\s*$/im.test(robots))
  ok('dist/robots.txt', 0, 'robots', 'allows /');
else check('dist/robots.txt', 0, 'robots', 'does not allow /');
const headers = read(join(dist, '_headers'));
if (headers === null) check('dist/_headers', 0, 'headers', 'missing');
else {
  const blocks = {};
  let cur = null;
  for (const l of headers.split('\n')) {
    if (/^\s*#/.test(l) || !l.trim()) continue;
    if (!/^\s/.test(l)) blocks[(cur = l.trim())] = [];
    else if (cur) blocks[cur].push(l.trim());
  }
  for (const path of ['/llms.txt', '/llms-full.txt']) {
    if ((blocks[path] || []).some((h) => /^X-Robots-Tag:\s*noindex$/i.test(h))) ok('dist/_headers', 0, 'headers', `${path} X-Robots-Tag: noindex`);
    else check('dist/_headers', 0, 'headers', `${path} lacks X-Robots-Tag: noindex`);
  }
}

// ---------------------------------------------------------------- 5. size
const full = join(dist, 'llms-full.txt');
if (existsSync(full)) {
  const n = statSync(full).size;
  if (n < 25000) ok('dist/llms-full.txt', 0, 'size', `${n} bytes (limit 25,000)`);
  else check('dist/llms-full.txt', 0, 'size', `${n} bytes (limit 25,000)`);
}

// ---------------------------------------------------------------- 6. weight (PRD 11)
if (index !== null) {
  const astroDir = join(dist, '_astro');
  const assets = existsSync(astroDir) ? readdirSync(astroDir) : [];
  const size = (f) => statSync(join(astroDir, f)).size;
  // Count stylesheets loaded by the main page, not route-specific CSS for /1.
  const cssFiles = new Set([...index.matchAll(/<link\b[^>]*\bhref=["'](\/_astro\/[^"']+\.css)["'][^>]*>/g)].map((m) => m[1].split('/').pop()));
  const css = [...cssFiles].reduce((sum, file) => sum + size(file), 0);
  const inlineJs = [...index.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].reduce((a, m) => a + Buffer.byteLength(m[1]), 0);
  // Count scripts reachable from the main page, including imported chunks.
  // Isolated concept routes may ship their own WebGL runtime.
  const visited = new Set();
  const scriptSize = (name) => {
    const file = name.split('/').pop();
    if (visited.has(file)) return 0;
    visited.add(file);
    const code = readFileSync(join(astroDir, file), 'utf8');
    const imports = [...code.matchAll(/(?:from\s*|import\s*\(?)["']([^"']+\.js)["']/g)];
    return size(file) + imports.reduce((sum, match) => sum + scriptSize(match[1]), 0);
  };
  const entryScripts = [...index.matchAll(/<script\b[^>]*src=["']([^"']+)["']/g)];
  const js = entryScripts.reduce((sum, match) => sum + scriptSize(match[1]), 0) + inlineJs;
  const html = Buffer.byteLength(index);
  if (html + css < 100000) ok('dist/index.html', 0, 'weight', `HTML ${html} + CSS ${css} bytes (limit 100,000)`);
  else check('dist/index.html', 0, 'weight', `HTML ${html} + CSS ${css} bytes (limit 100,000)`);
  if (js < 5000) ok('dist/index.html', 0, 'weight', `script ${js} bytes (limit 5,000)`);
  else check('dist/index.html', 0, 'weight', `script ${js} bytes (limit 5,000)`);
}

// ---------------------------------------------------------------- 7. no copy in components
// Literal text outside {expressions} in .astro templates, and literal aria-label/title/alt/placeholder values.
// src/pages/404.astro is excluded: PRD 9 keeps it unchanged.
function astroFiles(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? astroFiles(p) : p.endsWith('.astro') ? [p] : [];
  });
}
function stripBraces(s) {
  let out = '';
  let inner = '';
  let depth = 0;
  const literals = [];
  for (const ch of s) {
    if (ch === '{') {
      depth++;
      if (depth === 1) {
        inner = '';
        continue;
      }
    }
    if (ch === '}' && depth > 0) {
      depth--;
      if (depth === 0) {
        for (const m of inner.matchAll(/>([^<>{}]*[A-Za-z][^<>{}]*)</g)) literals.push(m[1].trim());
        out += ' ';
        continue;
      }
    }
    if (depth > 0) inner += ch;
    else out += ch;
  }
  return { out, literals };
}
for (const p of astroFiles(join(root, 'src'))) {
  if (rel(p) === 'src/pages/404.astro') continue;
  let src = readFileSync(p, 'utf8');
  src = src.replace(/^---[\s\S]*?\n---/, '');
  src = src.replace(/<script\b[\s\S]*?<\/script>/g, ' ').replace(/<style\b[\s\S]*?<\/style>/g, ' ').replace(/<!--[\s\S]*?-->/g, ' ');
  for (const m of src.matchAll(/\b(aria-label|title|alt|placeholder)="([^"]*[A-Za-z][^"]*)"/g)) check(rel(p), 0, 'copy-in-markup', `${m[1]}="${m[2]}"`);
  const { out, literals } = stripBraces(src);
  const text = out.replace(/<[^>]*>/g, ' ');
  const words = [...text.matchAll(/[^\s]*[A-Za-z][^\s]*/g)].map((m) => m[0]);
  for (const w of [...new Set(words)]) check(rel(p), 0, 'copy-in-markup', w);
  for (const l of literals) check(rel(p), 0, 'copy-in-markup', l);
}

// ---------------------------------------------------------------- report
rows.sort((a, b) => (a.file === b.file ? a.line - b.line : a.file < b.file ? -1 : 1));
const seen = new Set();
let checks = 0;
for (const r of rows) {
  const s = `${r.file}:${r.line} [${r.rule}] ${r.status} ${r.text}`;
  if (seen.has(s)) continue;
  seen.add(s);
  if (r.status === 'CHECK') checks++;
  console.log(s);
}
for (const n of notes) console.log(n);
console.log('');
if (checks) {
  console.log(`CHECK lines: ${checks}. Label them (the team's copy rules), fix the page, or confirm each is a fact, not a claim.`);
  process.exit(1);
}
console.log('No CHECK lines.');
