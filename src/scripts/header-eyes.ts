import { requestMotionFrame, cancelMotionFrame } from './motion-clock';
/** Small decorative companion: no focus stop or action competing with the logo. */
export function attachHeaderEyes() {
  const disposers = Array.from(
    document.querySelectorAll<HTMLElement>('.tracker-gaze'),
    attachGaze,
  );
  return () => disposers.forEach(dispose => dispose());
}

function attachGaze(gaze: HTMLElement) {
  const capsule = gaze.parentElement!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let x = 0, y = 0, vx = 0, vy = 0, tx = 0, ty = 0, frame = 0, previous = 0;
  const tick = (now: number) => {
    const dt = Math.min((now - (previous || now)) / 1000, .032);
    previous = now;
    vx += ((tx - x) * 190 - vx * 23) * dt;
    vy += ((ty - y) * 190 - vy * 23) * dt;
    x += vx * dt; y += vy * dt;
    gaze.style.transform = `translate(${x}px, ${y}px)`;
    if (Math.abs(tx-x)+Math.abs(ty-y)+Math.abs(vx)+Math.abs(vy) > .015) frame = requestMotionFrame(tick);
    else { frame = 0; previous = 0; }
  };
  const start = () => { if (!frame) frame = requestMotionFrame(tick); };
  const move = (event: PointerEvent) => {
    if (event.pointerType === 'touch' || reduced.matches) return;
    const box = capsule.getBoundingClientRect();
    const dx = event.clientX - box.left - box.width/2;
    const dy = event.clientY - box.top - box.height/2;
    const length = Math.hypot(dx, dy);
    const strength = Math.min(length / 180, 1) * .55;
    tx = length ? dx / length * 11 * strength : 0;
    ty = length ? dy / length * 8 * strength : 0;
    start();
  };
  const reset = () => { tx=0; ty=0; start(); };
  const motionChange = () => { if(reduced.matches) { cancelMotionFrame(frame); frame=0; x=y=vx=vy=tx=ty=previous=0; gaze.style.transform='none'; } };
  window.addEventListener('pointermove', move, {passive:true});
  document.documentElement.addEventListener('pointerleave', reset);
  window.addEventListener('blur', reset);
  reduced.addEventListener('change', motionChange);
  return () => {
    cancelMotionFrame(frame);
    window.removeEventListener('pointermove',move);
    document.documentElement.removeEventListener('pointerleave',reset);
    window.removeEventListener('blur',reset);
    reduced.removeEventListener('change',motionChange);
  };
}
