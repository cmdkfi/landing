import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
import { onMotionFrame } from './motion-clock';

export function attachPageMotion() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let lenis: Lenis | undefined;
  const configure = () => {
    lenis?.destroy();
    lenis = reduced.matches ? undefined : new Lenis({
      autoRaf: false, smoothWheel: true, syncTouch: false, lerp: .1,
      anchors: false,
      prevent: node => !!node.closest('dialog, [data-lenis-prevent]'),
      virtualScroll: ({ deltaX, deltaY }) =>
        !document.querySelector('dialog[open]') && Math.abs(deltaX) <= Math.abs(deltaY),
    });
    if (document.querySelector('dialog[open]')) lenis?.stop();
  };
  configure();
  reduced.addEventListener('change', configure);
  const removeScroll = onMotionFrame(time => lenis?.raf(time));
  const syncDialog = () => {
    if (document.querySelector('dialog[open]')) lenis?.stop();
    else lenis?.start();
  };
  const dialogObserver = new MutationObserver(syncDialog);
  document.querySelectorAll('dialog').forEach(dialog => dialogObserver.observe(dialog, { attributes: true, attributeFilter: ['open'] }));
  syncDialog();

  // Keep authored CSS keyframes/easing, but pause their browser timelines.
  // GSAP alone advances their playheads, including CSS hover transitions.
  const playheads = new Map<Animation, gsap.core.Tween>();
  function capture(target: Element) {
    for (const animation of target.getAnimations()) {
      if (playheads.has(animation) || animation.playState !== 'running') continue;
      const timing = animation.effect?.getComputedTiming();
      if (!timing || !Number(timing.duration)) continue;
      const infinite = timing.endTime === Infinity;
      const duration = Number(timing.duration);
      const end = infinite ? duration * 2 : Number(timing.endTime);
      const start = Number(animation.currentTime) || 0;
      const playhead = { time: start };
      animation.pause();
      const tween = gsap.to(playhead, {
        time: end, duration: Math.max(.001, (end - start) / 1000), ease: 'none',
        repeat: infinite ? -1 : 0,
        onUpdate: () => {
          if (animation.playState === 'idle') { tween.kill(); playheads.delete(animation); }
          else animation.currentTime = playhead.time;
        },
        onComplete: () => { animation.finish(); playheads.delete(animation); },
      });
      playheads.set(animation, tween);
    }
  }
  const onAnimation = (event: Event) => { if (event.target instanceof Element) capture(event.target); };
  document.addEventListener('animationstart', onAnimation, true);
  document.addEventListener('transitionrun', onAnimation, true);
  document.getAnimations().forEach(animation => {
    const target = (animation.effect as KeyframeEffect | null)?.target;
    if (target instanceof Element) capture(target);
  });
  const visibility = () => playheads.forEach(tween => document.hidden ? tween.pause() : tween.resume());
  document.addEventListener('visibilitychange', visibility);
  // Keyboard navigation is immediate, without smooth-scroll inertia.
  const keyboard = (event: KeyboardEvent) => {
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', 'Tab', ' '].includes(event.key)) {
      lenis?.scrollTo(window.scrollY, { immediate: true });
    }
  };
  document.addEventListener('keydown', keyboard);
  const anchorClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
    if (!anchor || anchor.target || anchor.hasAttribute('download')) return;
    const url = new URL(anchor.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return;
    let id: string;
    try { id = decodeURIComponent(url.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const top = window.scrollY + target.getBoundingClientRect().top - 72;
    if (lenis) lenis.scrollTo(top, { immediate: event.detail === 0 });
    else window.scrollTo({ top, behavior: 'instant' });
    history.pushState(null, '', url.hash);
    if (event.detail === 0) {
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
        target.addEventListener('blur', () => target.removeAttribute('tabindex'), {once:true});
      }
      target.focus({preventScroll:true});
    }
  };
  document.addEventListener('click', anchorClick);

  return {
    scrollTo(top: number, immediate = false) {
      if (lenis) lenis.scrollTo(top, { immediate });
      else window.scrollTo({ top, behavior: 'instant' });
    },
    dispose() {
      removeScroll(); dialogObserver.disconnect(); lenis?.destroy();
      reduced.removeEventListener('change', configure);
      document.removeEventListener('animationstart', onAnimation, true);
      document.removeEventListener('transitionrun', onAnimation, true);
      document.removeEventListener('visibilitychange', visibility);
      document.removeEventListener('keydown', keyboard);
      document.removeEventListener('click', anchorClick);
      playheads.forEach((tween, animation) => { tween.kill(); animation.cancel(); });
      playheads.clear();
    },
  };
}
