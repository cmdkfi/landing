import { gsap } from 'gsap';

// All renderers receive one monotonic millisecond clock. Hidden tabs do not
// consume replay time, and returning from sleep cannot jump a simulation.
let now = 0;
let nextId = 0;
const frames = new Map<number, FrameRequestCallback>();
const listeners = new Set<(time: number) => void>();
export const motionNow = () => now;
export function requestMotionFrame(callback: FrameRequestCallback) {
  const id = ++nextId;
  frames.set(id, callback);
  return id;
}
export function cancelMotionFrame(id: number) { frames.delete(id); }
export function onMotionFrame(callback: (time: number) => void) {
  listeners.add(callback);
  return () => { listeners.delete(callback); };
}
export const motionScheduler = { request: requestMotionFrame, cancel: cancelMotionFrame, now: motionNow };
function tick(_time: number, delta: number) {
  if (document.hidden) return;
  now += Math.min(delta, 64);
  listeners.forEach(listener => listener(now));
  const batch = [...frames];
  for (const [id, callback] of batch) {
    if (!frames.delete(id)) continue;
    callback(now);
  }
}
if (typeof window !== 'undefined') gsap.ticker.add(tick);
if (import.meta.hot) import.meta.hot.dispose(() => {
  gsap.ticker.remove(tick);
  frames.clear(); listeners.clear();
});
