import { onMotionFrame } from './motion-clock';

export function attachLtvStage() {
  const stage = document.querySelector<HTMLElement>('.ltv-stage');
  const card = stage?.querySelector<HTMLElement>('.ltv-stage-window');
  const copy = stage?.querySelector<HTMLElement>('.ltv-stage-copy');
  if (!stage || !card || !copy) return () => {};
  const enabled = matchMedia('(min-width: 1001px) and (prefers-reduced-motion: no-preference)');
  let dirty = true;
  const invalidate = () => { dirty = true; };
  function render() {
    if (!dirty) return;
    dirty = false;
    stage!.classList.toggle('is-motion', enabled.matches);
    if (!enabled.matches) {
      card!.style.removeProperty('transform');
      copy!.style.removeProperty('opacity');
      copy!.style.removeProperty('transform');
      copy!.removeAttribute('aria-hidden');
      copy!.inert = false;
      return;
    }
    const rect = stage!.getBoundingClientRect();
    const travel = Math.max(1, stage!.offsetHeight - innerHeight);
    const progress = Math.max(0, Math.min(1, (112 - rect.top) / travel));
    const eased = progress * progress * (3 - 2 * progress);
    const distance = Math.max(0, (stage!.clientWidth - 48 - card!.offsetWidth) / 2);
    card!.style.transform = `translate3d(${distance * eased}px,0,0)`;
    const reveal = Math.max(0, Math.min(1, (progress - .2) / .45));
    copy!.style.opacity = String(reveal);
    copy!.style.transform = `translate3d(${24 * (1 - reveal)}px,0,0)`;
    const hidden = String(reveal === 0);
    if (copy!.getAttribute('aria-hidden') !== hidden) copy!.setAttribute('aria-hidden', hidden);
    copy!.inert = reveal === 0;
  }
  window.addEventListener('scroll', invalidate, { passive: true });
  window.addEventListener('resize', invalidate);
  enabled.addEventListener('change', invalidate);
  const removeFrame = onMotionFrame(render);
  render();
  return () => {
    removeFrame(); window.removeEventListener('scroll', invalidate);
    window.removeEventListener('resize', invalidate);
    enabled.removeEventListener('change', invalidate);
    stage.classList.remove('is-motion');
    card.style.removeProperty('transform');
    copy.style.removeProperty('opacity'); copy.style.removeProperty('transform');
    copy.removeAttribute('aria-hidden');
    copy.inert = false;
  };
}
