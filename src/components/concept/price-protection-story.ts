import { protectionPlayer } from '../../content/protection-player';
import { onMotionFrame } from '../../scripts/motion-clock';
import { DURATION } from './ltv-scenario';
import './borrow-show/borrow-show.css';

// One clock owns the chart and the reading beats. Manual navigation pauses it.
export function initProtectionStory(root: HTMLElement) {
  const pages = Array.from(root.querySelectorAll<HTMLElement>('[data-protection-page]'));
  const features = Array.from(root.querySelectorAll<HTMLElement>('[data-feature-page]'));
  const prev = root.querySelector<HTMLButtonElement>('[data-prev]')!;
  const next = root.querySelector<HTMLButtonElement>('[data-next]')!;
  const watch = root.querySelector<HTMLButtonElement>('[data-watch]');
  const pause = root.querySelector<HTMLButtonElement>('[data-pause]');
  const replay = root.querySelector<HTMLButtonElement>('[data-replay]');
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const durations = [DURATION + 1600, ...features.map(node => Math.max(5000, (node.textContent?.split(/\s+/).length ?? 0) * 230))];
  let started = false;
  let step = 0, elapsed = 0, playing = false, visible = false, previous = 0;
  let transition: Animation | undefined;
  const migration = root.dataset.demoKind === 'venue';
  const loan = root.querySelector<HTMLElement>('[data-migration-loan]');
  const destination = root.querySelector<HTMLElement>('[data-market-b]');
  const status = root.querySelector<HTMLElement>('[data-migration-status]');
  const chart = (time: number) => {
    if (migration && loan && destination && status) {
      const p = Math.max(0, Math.min(1, (time - 3200) / 2800));
      const ease = p * p * (3 - 2 * p);
      loan.style.transform = `translateX(${destination.offsetLeft * ease}px)`;
      const beat = time < 1600 ? 0 : time < 3200 ? 1 : time < 6000 ? 2 : 3;
      if (status.textContent !== protectionPlayer.migrationBeats[beat]) status.textContent = protectionPlayer.migrationBeats[beat];
    }
    root.dataset.demoElapsed = String(time);
    root.dispatchEvent(new Event('price-demo-frame'));
  };
  const controls = () => {
    watch?.setAttribute('aria-pressed', String(playing));
    if (pause) { pause.textContent = playing ? 'Pause' : 'Resume'; pause.disabled = !started || media.matches || (step === features.length && elapsed >= durations[step]); }
    if (watch) watch.disabled = media.matches;
    if (replay) replay.disabled = media.matches;
  };
  const show = (animate = false) => {
    transition?.cancel();
    pages[0].hidden = step !== 0;
    pages[1].hidden = step === 0;
    features.forEach((node, i) => node.hidden = i !== step - 1);
    prev.disabled = step === 0;
    next.disabled = step === features.length;
    root.querySelector('[data-page-label]')!.textContent = `${step + 1} / ${features.length + 1}`;
    if (animate && !media.matches) {
      const target = step === 0 ? pages[0] : features[step - 1];
      transition = target.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 220, easing: 'cubic-bezier(.22,1,.36,1)' });
    }
    controls();
  };
  const manual = (delta: number, event: MouseEvent) => {
    started = true; playing = false; elapsed = 0; previous = 0;
    step = Math.max(0, Math.min(features.length, step + delta));
    if (step === 0) elapsed = DURATION;
    chart(DURATION); show(event.detail !== 0);
  };
  prev.onclick = event => manual(-1, event);
  next.onclick = event => manual(1, event);
  const start = () => {
    if (media.matches) return;
    started = true; step = 0; elapsed = 0; previous = 0; playing = true;
    chart(0); show();
  };
  if (watch) watch.onclick = start;
  if (replay) replay.onclick = start;
  if (pause) pause.onclick = () => { playing = !playing; previous = 0; controls(); };
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; previous = 0; }, { threshold: .2 });
  observer.observe(root);
  const resize = new ResizeObserver(() => {
    if (migration) chart(Number(root.dataset.demoElapsed ?? DURATION));
  });
  resize.observe(root);
  const unsubscribe = onMotionFrame(now => {
    if (!watch || !playing || !visible || document.hidden || media.matches) { previous = 0; return; }
    if (previous) elapsed += now - previous;
    previous = now;
    if (step === 0) chart(Math.min(DURATION, elapsed));
    if (elapsed >= durations[step]) {
      if (step === features.length) { playing = false; controls(); }
      else { step++; elapsed = 0; show(true); }
    }
  });
  const reduced = () => {
    if (media.matches) { playing = false; step = 0; elapsed = 0; chart(DURATION); show(); }
    controls();
  };
  media.addEventListener('change', reduced);
  chart(DURATION); show();
  if (pause) pause.disabled = true;
  reduced();
  document.addEventListener('astro:before-swap', () => {
    unsubscribe(); observer.disconnect(); resize.disconnect(); transition?.cancel(); media.removeEventListener('change', reduced);
  }, { once: true });
}
