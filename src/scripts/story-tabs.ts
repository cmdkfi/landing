import { gsap } from 'gsap';

export function attachStoryTabs() {
  const stage = document.querySelector<HTMLElement>('.ltv-stage');
  if (!stage) return () => {};
  const tabs = Array.from(stage.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const panels = Array.from(stage.querySelectorAll<HTMLElement>('[role="tabpanel"]'));
  const descriptions = Array.from(stage.querySelectorAll<HTMLElement>('.story-description'));
  let active = 0;
  let entrance: gsap.core.Tween | undefined;
  function select(index: number, focus = false, animate = false) {
    if (index === active) { if (focus) tabs[index].focus({ preventScroll: true }); return; }
    active = index;
    entrance?.revert();
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
      descriptions[i].hidden = i !== index;
    });
    if (animate && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      entrance = gsap.fromTo(panels[index], { opacity: .35, y: 10 }, {
        opacity: 1, y: 0, duration: .24, ease: 'power2.out', clearProps: 'opacity,transform',
      });
    }
    if (focus) tabs[index].focus({ preventScroll: true });
    window.dispatchEvent(new Event('resize'));
  }
  const handlers = tabs.map((tab, index) => {
    const click = (event: MouseEvent) => {
      select(index, false, event.detail !== 0);
      stage.dispatchEvent(new CustomEvent('story-request', { detail: index }));
    };
    const key = (event: KeyboardEvent) => {
      let next = index;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault(); select(next, true);
      stage.dispatchEvent(new CustomEvent('story-request', { detail: next }));
    };
    tab.addEventListener('click', click); tab.addEventListener('keydown', key);
    return () => { tab.removeEventListener('click', click); tab.removeEventListener('keydown', key); };
  });
  const scrollSelect = (event: Event) => select((event as CustomEvent<number>).detail, false, true);
  stage.addEventListener('story-scroll', scrollSelect);
  return () => { handlers.forEach(remove => remove()); entrance?.revert(); stage.removeEventListener('story-scroll', scrollSelect); };
}
