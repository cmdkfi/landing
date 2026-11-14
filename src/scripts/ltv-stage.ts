import { onMotionFrame } from './motion-clock';

export function attachLtvStage() {
  const stage = document.querySelector<HTMLElement>('.ltv-stage');
  const card = stage?.querySelector<HTMLElement>('.ltv-stage-window');
  const copy = stage?.querySelector<HTMLElement>('.ltv-stage-copy');
  if (!stage || !card || !copy) return () => {};
  const rails = [...stage.querySelectorAll<HTMLElement>('.control-rail')];
  const resetRails = () => rails.forEach(rail => { rail.style.removeProperty('opacity'); rail.style.removeProperty('transform'); rail.removeAttribute('aria-hidden'); rail.inert = false; });
  const enabled = matchMedia('(min-width: 1101px) and (prefers-reduced-motion: no-preference)');
  let dirty = true;
  const invalidate = () => { dirty = true; };
  function render() {
    if (!dirty) return;
    dirty = false;
    stage!.classList.toggle('is-motion', enabled.matches);
    if (!enabled.matches) {
      resetRails();
      card!.style.removeProperty('transform');
      copy!.style.removeProperty('opacity');
      copy!.style.removeProperty('transform');
      copy!.removeAttribute('aria-hidden');
      copy!.inert = false;
      return;
    }
    const rect = stage!.getBoundingClientRect();
    const travel = Math.max(1, innerHeight * 1.1);
    const progress = Math.max(0, Math.min(1, (parseFloat(getComputedStyle(stage!.querySelector('.ltv-stage-sticky')!).top) - rect.top) / travel));
    const departure = Math.max(0, Math.min(1, progress / .28));
    rails.forEach(rail => {
      rail.style.opacity = String(1 - departure);
      rail.style.transform = `translate3d(0,${24 * departure}px,0)`;
      rail.setAttribute('aria-hidden', String(departure === 1));
      rail.inert = departure === 1;
    });
    const movement = Math.max(0, Math.min(1, (progress - .28) / .55));
    const eased = movement * movement * (3 - 2 * movement);
    const availableWidth = stage!.querySelector<HTMLElement>('.ltv-stage-sticky')!.clientWidth;
    const distance = Math.max(0, (availableWidth - card!.offsetWidth) / 2);
    card!.style.transform = `translate3d(${distance * eased}px,0,0)`;
    const reveal = Math.max(0, Math.min(1, (progress - .48) / .35));
    copy!.style.opacity = String(reveal);
    copy!.style.transform = `translate3d(${24 * (1 - reveal)}px,0,0)`;
    const hidden = String(reveal === 0);
    if (copy!.getAttribute('aria-hidden') !== hidden) copy!.setAttribute('aria-hidden', hidden);
    copy!.inert = reveal === 0;
    const offset = parseFloat(getComputedStyle(stage!.querySelector('.ltv-stage-sticky')!).top) - rect.top;
    const index = Math.max(0, Math.min(2, Math.floor((offset - travel) / (innerHeight * .9))));
    // Never hide a form while the user is typing or operating its controls.
    if (!card!.contains(document.activeElement)) stage!.dispatchEvent(new CustomEvent('story-scroll', { detail: index }));
  }
  const request = (event: Event) => {
    if (!enabled.matches) return;
    const top = parseFloat(getComputedStyle(stage.querySelector('.ltv-stage-sticky')!).top);
    const index = (event as CustomEvent<number>).detail;
    const target = scrollY + stage.getBoundingClientRect().top - top + innerHeight * (1.1 + .9 * (index + .35));
    window.dispatchEvent(new CustomEvent('cmdk-scroll-to', { detail: target }));
  };
  stage.addEventListener('story-request', request);
  window.addEventListener('scroll', invalidate, { passive: true });
  window.addEventListener('resize', invalidate);
  enabled.addEventListener('change', invalidate);
  const removeFrame = onMotionFrame(render);
  render();
  return () => {
    stage.removeEventListener('story-request', request);
    removeFrame(); window.removeEventListener('scroll', invalidate);
    window.removeEventListener('resize', invalidate);
    enabled.removeEventListener('change', invalidate);
    resetRails();
    stage.classList.remove('is-motion');
    card.style.removeProperty('transform');
    copy.style.removeProperty('opacity'); copy.style.removeProperty('transform');
    copy.removeAttribute('aria-hidden');
    copy.inert = false;
  };
}
