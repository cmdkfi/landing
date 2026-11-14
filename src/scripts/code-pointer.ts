/** A local cursor wake, independent of the glyphs' slow background drift. */
export function attachCodePointer(surface: HTMLElement) {
  const glyphs = [...surface.querySelectorAll<HTMLElement>('.code-atmosphere span')];
  const allowed = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const states = glyphs.map(el => ({ el, x: 0, y: 0 }));
  let pointer: { x: number; y: number } | undefined;
  let frame = 0;
  let previous = 0;
  function tick(now: number) {
    frame = 0;
    const ease = 1 - Math.exp(-Math.min(now - previous || 16, 40) / 110);
    previous = now;
    // Batch geometry reads before writes; subtract the previous wake displacement.
    const boxes = states.map(s => s.el.getBoundingClientRect());
    let unsettled = false;
    states.forEach((s, i) => {
      const b = boxes[i];
      const dx = b.x + b.width / 2 - s.x - (pointer?.x ?? 0);
      const dy = b.y + b.height / 2 - s.y - (pointer?.y ?? 0);
      const distance = Math.hypot(dx, dy);
      const influence = pointer ? Math.max(0, 1 - distance / 190) ** 2 : 0;
      const strength = 48 * influence;
      const tx = dx / Math.max(distance, 1) * strength;
      const ty = dy / Math.max(distance, 1) * strength;
      s.x += (tx - s.x) * ease;
      s.y += (ty - s.y) * ease;
      unsettled ||= Math.abs(s.x) + Math.abs(s.y) > .05;
      s.el.style.translate = `${s.x.toFixed(2)}px ${s.y.toFixed(2)}px`;
    });
    if (pointer || unsettled) frame = requestAnimationFrame(tick);
  }
  function start() { if (!frame) { previous = 0; frame = requestAnimationFrame(tick); } }
  function move(event: PointerEvent) {
    if (!allowed.matches || event.pointerType !== 'mouse') return;
    pointer = { x: event.clientX, y: event.clientY };
    start();
  }
  function leave() { pointer = undefined; start(); }
  function reset() {
    pointer = undefined;
    cancelAnimationFrame(frame); frame = 0;
    states.forEach(s => { s.x = s.y = 0; s.el.style.removeProperty('translate'); });
  }
  function visibility() { if (document.hidden) reset(); }
  surface.addEventListener('pointermove', move, { passive: true });
  surface.addEventListener('pointerleave', leave);
  window.addEventListener('scroll', leave, { passive: true });
  allowed.addEventListener('change', reset);
  document.addEventListener('visibilitychange', visibility);
  return () => {
    reset();
    surface.removeEventListener('pointermove', move);
    surface.removeEventListener('pointerleave', leave);
    window.removeEventListener('scroll', leave);
    allowed.removeEventListener('change', reset);
    document.removeEventListener('visibilitychange', visibility);
  };
}
