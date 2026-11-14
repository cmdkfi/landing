import gsap from 'gsap';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

type FrameCallback = (time: number) => void;

let nextFrameId = 1;
const queued = new Map<number, FrameCallback>();

export function motionNow() {
  return gsap.ticker.time * 1000;
}

export function requestMotionFrame(callback: FrameCallback) {
  const id = nextFrameId++;
  queued.set(id, callback);
  return id;
}

export function cancelMotionFrame(id: number) {
  queued.delete(id);
}

function flushFrames(time: number) {
  const pending = [...queued.values()];
  queued.clear();
  for (const callback of pending) callback(time * 1000);
}

gsap.ticker.lagSmoothing(0);
gsap.ticker.add(flushFrames);

const nativeStarts = new WeakMap<Animation, number>();
function syncNativeAnimations(time: number) {
  const milliseconds = time * 1000;
  for (const animation of document.getAnimations()) {
    if (!(animation instanceof CSSAnimation || animation instanceof CSSTransition)) continue;
    let start = nativeStarts.get(animation);
    if (start === undefined) {
      start = milliseconds - (typeof animation.currentTime === 'number' ? animation.currentTime : 0);
      nativeStarts.set(animation, start);
      animation.pause();
    }
    animation.currentTime = milliseconds - start;
  }
}
gsap.ticker.add(syncNativeAnimations);

let smoothScroll: Lenis | undefined;
let scrollTick: ((time: number) => void) | undefined;

export function startSmoothScroll() {
  if (smoothScroll) return smoothScroll;
  smoothScroll = new Lenis({
    autoRaf: false,
    anchors: true,
    respectReducedMotion: true,
    lerp: 0.12,
    prevent: node => Boolean(node.closest('dialog[open], .dial-wheel')),
  });
  document.documentElement.dataset.lenis = '';
  scrollTick = time => smoothScroll?.raf(time * 1000);
  gsap.ticker.add(scrollTick, false, true);
  return smoothScroll;
}

export function getSmoothScroll() {
  return smoothScroll;
}

export function stopSmoothScroll() {
  if (scrollTick) gsap.ticker.remove(scrollTick);
  scrollTick = undefined;
  smoothScroll?.destroy();
  smoothScroll = undefined;
  delete document.documentElement.dataset.lenis;
}

if (import.meta.hot) import.meta.hot.dispose(() => {
  stopSmoothScroll();
  gsap.ticker.remove(flushFrames);
  gsap.ticker.remove(syncNativeAnimations);
  queued.clear();
});
