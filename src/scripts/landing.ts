// Progressive enhancement: native disclosures and complete content work without JavaScript.
const menu = document.querySelector<HTMLDetailsElement>('[data-mobile-menu]');
menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => { menu.open = false; }));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu?.open && !document.querySelector('dialog[open]')) {
    menu.open = false;
    menu.querySelector('summary')?.focus();
  }
});
document.addEventListener('click', (event) => {
  if (menu?.open && !menu.contains(event.target as Node) && !(event.target as Element).closest('dialog')) menu.open = false;
});
const disclosure = document.querySelector<HTMLDetailsElement>('[data-directory-disclosure]');
const controls = document.querySelector<HTMLElement>('[data-directory-controls]');
const search = document.querySelector<HTMLInputElement>('[data-feature-search]');
const filters = document.querySelectorAll<HTMLButtonElement>('[data-status-filter]');
const groups = document.querySelectorAll<HTMLElement>('[data-status-group]');
const counter = document.querySelector<HTMLElement>('[data-feature-count]');
const empty = document.querySelector<HTMLElement>('[data-empty-results]');
let selected = 'all';
function filterFeatures(): void {
  const query = search?.value.trim().toLocaleLowerCase() ?? '';
  let shown = 0;
  for (const group of groups) {
    let groupCount = 0;
    for (const row of group.querySelectorAll<HTMLTableRowElement>('[data-status-row]')) {
      const match = (selected === 'all' || row.dataset.status === selected) && (row.textContent ?? '').toLocaleLowerCase().includes(query);
      row.hidden = !match;
      if (match) groupCount++;
    }
    group.hidden = groupCount === 0;
    shown += groupCount;
  }
  if (counter) counter.textContent = String(shown) + ' ' + counter.dataset.suffix;
  if (empty) empty.hidden = shown !== 0;
}
if (controls) { controls.hidden = false; filterFeatures(); }
search?.addEventListener('input', filterFeatures);
for (const button of filters) button.addEventListener('click', () => {
  selected = button.dataset.statusFilter ?? 'all';
  for (const item of filters) item.setAttribute('aria-pressed', String(item === button));
  filterFeatures();
});
function revealHash(): void {
  if (location.hash === '#status' && disclosure) disclosure.open = true;
}
revealHash();
window.addEventListener('hashchange', revealHash);
