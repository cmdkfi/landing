import { gsap } from 'gsap';

// Match the reference's grouped, once-only text entrance without touching controls
// or live values. All tweens use the page's existing GSAP clock.
export function attachTextReveal() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const seen = new Set<HTMLElement>();
  const watched = new Set<HTMLElement>();
  const tweens = new Set<gsap.core.Tween>();
  let keyboard = false;
  const selector = [
    'h1', 'h2', 'h3', '.hands-subtitle', '.concept-eyebrow',
    '.dial-intro > p', '.dial-narrative > p', '.incident-closing', '.incident-footnote > p',
    '.origin-copy > .eyebrow', '.origin-copy > p', '.origin-copy > .micro',
    '.corridor-rules > div', '.map-stat > strong', '.map-stat > .label', '.map-stat > p',
    '.position-label', '.incident-chart-topline', '.incident-comparator > div',
    '.ltv-threshold > span', '.scale-definition', '.scenario-values > div > span',
  ].join(',');
  function reveal(element: HTMLElement | null, instant = false, delay = 0) {
    if (!element || seen.has(element)) return;
    seen.add(element);
    observer.unobserve(element);
    if (instant || reduced.matches || keyboard) return;
    const tween = gsap.fromTo(element,
      { opacity: 0, y: 40, filter: 'blur(8px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, delay,
        ease: 'power4.out', clearProps: 'opacity,transform,filter',
        onComplete: () => tweens.delete(tween) });
    tweens.add(tween);
  }
  const observer = new IntersectionObserver(entries => {
    let index = 0;
    for (const entry of entries) {
      const element = entry.target as HTMLElement;
      if (entry.isIntersecting && !element.closest('[inert], [aria-hidden="true"]')) {
        reveal(element, false, Math.min(index++ * .05, .25));
      }
    }
  }, { rootMargin: '0px 0px -18% 0px', threshold: 0 });
  function scan() {
    document.querySelectorAll<HTMLElement>(`main :is(${selector})`).forEach(element => {
      // Sticky story headings are revealed by their existing scene milestones.
      if (element.matches('#concept-title, .hands-title, #position-title') || seen.has(element)) return;
      if (element.closest('[inert], [aria-hidden="true"], .borrow-sandbox, .borrow-presentation')) return;
      if (!watched.has(element)) { watched.add(element); observer.observe(element); }
    });
  }
  const mutations = new MutationObserver(scan);
  const main = document.querySelector('main');
  if (main) mutations.observe(main, { subtree: true, childList: true, attributes: true, attributeFilter: ['inert', 'aria-hidden'] });
  const finish = () => { tweens.forEach(tween => tween.progress(1)); tweens.clear(); };
  const key = (event: KeyboardEvent) => {
    if (['Tab', 'PageDown', 'PageUp', 'Home', 'End', 'ArrowDown', 'ArrowUp', ' '].includes(event.key)) { keyboard = true; finish(); }
  };
  const pointer = () => { keyboard = false; };
  const preference = () => { if (reduced.matches) finish(); };
  document.addEventListener('keydown', key);
  document.addEventListener('pointerdown', pointer);
  document.addEventListener('wheel', pointer, { passive: true });
  reduced.addEventListener('change', preference);
  scan();
  return { reveal, dispose() {
    observer.disconnect(); mutations.disconnect();
    tweens.forEach(tween => tween.revert()); tweens.clear();
    document.removeEventListener('keydown', key);
    document.removeEventListener('pointerdown', pointer);
    document.removeEventListener('wheel', pointer);
    reduced.removeEventListener('change', preference);
  } };
}
