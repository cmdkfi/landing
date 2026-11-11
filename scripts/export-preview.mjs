// Export the current build for review without a web server. Never included in dist/.
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = path.join(root, 'dist');
const output = path.join(root, '.local-preview');
const mime = { '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.txt': 'text/plain;charset=utf-8' };
const local = (url) => path.join(dist, url.replace(/^\//, ''));
async function dataUrl(url) {
  const bytes = await readFile(local(url));
  return `data:${mime[path.extname(url)] ?? 'application/octet-stream'};base64,${bytes.toString('base64')}`;
}
async function replaceAsync(text, pattern, transform) {
  const matches = [...text.matchAll(pattern)];
  const values = await Promise.all(matches.map(transform));
  let index = 0;
  return text.replace(pattern, () => values[index++]);
}
await mkdir(output, { recursive: true });
for (const name of ['index', 'agents', '404']) {
  let html = await readFile(path.join(dist, `${name}.html`), 'utf8');
  html = await replaceAsync(html, /<link\b[^>]*rel="stylesheet"[^>]*>/g, async ([tag]) => {
    const href = tag.match(/href="([^"]+)"/)[1];
    let css = await readFile(local(href), 'utf8');
    css = await replaceAsync(css, /url\(["']?(\/[^)'"\s]+)["']?\)/g, async ([, url]) => `url("${await dataUrl(url)}")`);
    return `<style>${css}</style>`;
  });
  html = await replaceAsync(html, /<script\b([^>]*?)\bsrc="(\/_astro\/[^"]+)"([^>]*)><\/script>/g, async ([, before, url, after]) => {
    const js = await readFile(local(url), 'utf8');
    return `<script${before}${after}>${js.replace(/<\/script/gi, '<\\/script')}</script>`;
  });
  html = await replaceAsync(html, /\b(src|href)="(\/(?:fonts|tokens)\/[^" ]+|\/favicon\.svg)"/g, async ([, attr, url]) => `${attr}="${await dataUrl(url)}"`);
  html = html.replace(/href="\/(#[^"]*)?"/g, (_, hash = '') => `href="index.html${hash}"`);
  html = html.replace(/href="\/agents"/g, 'href="agents.html"');
  html = html.replace(/href="\/(llms(?:-full)?\.txt)"/g, 'href="$1"');
  html = html.replace(/data-src="\/llms-full\.txt"/g, `data-src="${await dataUrl('/llms-full.txt')}"`);
  await writeFile(path.join(output, `${name}.html`), html);
}
for (const file of ['llms.txt', 'llms-full.txt']) await copyFile(path.join(dist, file), path.join(output, file));
console.log(`Open ${path.join(output, 'index.html')} in your browser.`);
