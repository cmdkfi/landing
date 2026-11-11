// "Ask your agent": bar visibility, dialog open/close, copy buttons (PRD 8.3). No framework, no copy:
// every visible string comes from data attributes rendered from landing.ts. Without JavaScript the entry
// points are plain links to /agents and the bar never shows.

const dialog = document.querySelector<HTMLDialogElement>('[data-agent-dialog]');
const bar = document.querySelector<HTMLElement>('[data-agent-bar]');
const hero = document.getElementById('top');
const agentSection = document.getElementById('agent');

// ---------------------------------------------------------------- dialog
document.addEventListener('click', (e) => {
  const opener = (e.target as Element | null)?.closest?.('[data-agent-open]');
  if (!opener || !dialog || typeof dialog.showModal !== 'function') return; // no dialog: follow the /agents link
  e.preventDefault();
  if (!dialog.open) dialog.showModal();
  update();
});
dialog?.addEventListener('close', () => update());
// A click on the backdrop (the dialog element itself, outside its content) closes it.
dialog?.addEventListener('click', (e) => {
  if (e.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (e.clientX < bounds.left || e.clientX > bounds.right || e.clientY < bounds.top || e.clientY > bounds.bottom) dialog.close();
});

// ---------------------------------------------------------------- bar
const key = bar?.dataset.storageKey ?? '';
let dismissed = false;
try {
  dismissed = localStorage.getItem(key) === '1';
} catch {
  /* storage blocked: the bar may show again next visit */
}
let heroOut = false;
let agentInView = false;

function update(): void {
  if (!bar) return;
  const show = heroOut && !agentInView && !dismissed && !dialog?.open;
  bar.hidden = !show;
  // Keep the footer's last line clear of the bar while it shows.
  document.body.style.paddingBottom = show ? `${bar.offsetHeight}px` : '';
}

if (bar && hero && 'IntersectionObserver' in window) {
  new IntersectionObserver((entries) => {
    heroOut = !entries[entries.length - 1].isIntersecting;
    update();
  }).observe(hero);
  if (agentSection)
    new IntersectionObserver((entries) => {
      agentInView = entries[entries.length - 1].isIntersecting;
      update();
    }).observe(agentSection);
  window.addEventListener('resize', update);
  bar.querySelector('[data-agent-bar-close]')?.addEventListener('click', () => {
    dismissed = true;
    try {
      localStorage.setItem(key, '1');
    } catch {
      /* ignore */
    }
    update();
  });
}

// ---------------------------------------------------------------- copy buttons
function legacyCopy(text: string): boolean {
  const t = document.createElement('textarea');
  t.value = text;
  t.setAttribute('readonly', '');
  t.style.position = 'fixed';
  t.style.opacity = '0';
  (dialog?.open ? dialog : document.body).appendChild(t);
  t.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  t.remove();
  return ok;
}

async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  if (!legacyCopy(text)) throw new Error('copy failed');
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(String(res.status));
  return res.text();
}

// Fetch and copy in one user gesture: a ClipboardItem that takes a promise keeps the gesture in Safari.
async function copyUrl(url: string): Promise<void> {
  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    try {
      const blob = fetchText(url).then((t) => new Blob([t], { type: 'text/plain' }));
      await navigator.clipboard.write([new ClipboardItem({ 'text/plain': blob })]);
      return;
    } catch {
      /* fall through */
    }
  }
  await copyText(await fetchText(url));
}

for (const panel of document.querySelectorAll<HTMLElement>('[data-agent-panel]')) {
  const prompt = panel.querySelector<HTMLTextAreaElement>('[data-prompt]');
  for (const button of panel.querySelectorAll<HTMLButtonElement>('[data-copy]')) {
    button.hidden = false;
    const status = button.parentElement?.querySelector<HTMLElement>('[data-copy-status]');
    let timer = 0;
    button.addEventListener('click', async () => {
      try {
        if (button.dataset.copy === 'full') await copyUrl(button.dataset.src ?? '');
        else await copyText(prompt?.value ?? '');
        if (status) status.textContent = panel.dataset.copied ?? '';
      } catch {
        if (status) status.textContent = panel.dataset.failed ?? '';
        if (button.dataset.copy === 'prompt') prompt?.select();
      }
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (status) status.textContent = '';
      }, 4000);
    });
  }
}
