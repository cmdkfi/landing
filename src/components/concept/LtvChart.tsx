import { useEffect, useRef, useState } from 'react';
import { counterMeasure as copy } from '../../content/counter-measure';
import { Liveline } from 'liveline';
import { DURATION, progressAt, valuesAt } from './ltv-scenario';
import './ltv-chart.css';

export default function LtvChart() {
  const root = useRef<HTMLDivElement>(null);
  const controls = useRef({ toggle: () => {}, replay: () => {}, seek: (_: number) => {} });
  const [state, setState] = useState({ playing: false, phase: 0, reduced: false });
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const el = root.current!;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let elapsed = 0, frame = 0, previous = 0, phase = -1, lastDraw = 0;
    let visible = false, playing = true, reduced = motion.matches;
    const slider = el.querySelector<HTMLInputElement>('input')!;
    const updateState = (next: number) => { phase = next; setState({ playing, phase, reduced }); };
    const draw = () => {
      const p = progressAt(elapsed);
      const next = p < 1 ? 0 : p === 1 ? 1 : p < 2 ? 2 : p < 3 ? 3 : 4;
      setProgress(p);
      slider.value = String(elapsed);
      if (next !== phase) updateState(next);
    };
    const stop = () => { cancelAnimationFrame(frame); previous = 0; };
    const tick = (now: number) => {
      if (!playing || !visible || document.hidden || reduced) { stop(); return; }
      if (previous) elapsed = Math.min(DURATION, elapsed + now - previous);
      previous = now;
      if (now - lastDraw >= 32 || elapsed === DURATION) { draw(); lastDraw = now; }
      if (elapsed === DURATION) { playing = false; updateState(4); stop(); return; }
      frame = requestAnimationFrame(tick);
    };
    const schedule = () => { stop(); if (playing && visible && !document.hidden && !reduced) frame = requestAnimationFrame(tick); };
    controls.current = {
      toggle: () => { if (reduced) return; if (elapsed === DURATION) elapsed = 0; playing = !playing; draw(); updateState(phase); schedule(); },
      replay: () => { elapsed = reduced ? DURATION : 0; playing = !reduced; draw(); updateState(phase); schedule(); },
      seek: value => { elapsed = value; playing = false; stop(); draw(); updateState(phase); },
    };
    const onMotion = () => { reduced = motion.matches; if (reduced) { elapsed = DURATION; playing = false; } draw(); updateState(phase); schedule(); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }, { threshold: .25 });
    observer.observe(el);
    document.addEventListener('visibilitychange', schedule);
    motion.addEventListener('change', onMotion);
    onMotion();
    return () => { stop(); observer.disconnect(); document.removeEventListener('visibilitychange', schedule); motion.removeEventListener('change', onMotion); };
  }, []);
  const phases = [copy.replayFalling, copy.replayActing, copy.replayRecovering, copy.replaySettled, copy.replayComplete];
  const current = valuesAt(progress);
  const samples = Array.from({ length: Math.floor(progress * 40) + 1 }, (_, i) => i / 40);
  if (samples.length === 1 || samples.at(-1) !== progress) samples.push(Math.max(.0001, progress));
  const series = (['protected', 'exposed'] as const).map((id, i) => ({
    id, color: i ? '#b44440' : '#4b657a',
    data: samples.map(p => ({ time: p * 100, value: valuesAt(p)[id] })),
    value: current[id],
  }));
  return <div className="ltv-scenario" ref={root} data-phase={state.phase}>
    <div className="scenario-toolbar">
      <p role="status" aria-live="polite">{phases[state.phase]}</p>
      <div className="scenario-actions">
        <button type="button" disabled={state.reduced} onClick={() => controls.current.toggle()} aria-label={state.playing ? copy.pause : copy.play}>{state.playing ? 'Ⅱ' : '▶'}</button>
        <button type="button" onClick={() => controls.current.replay()} aria-label={copy.replayButton}>↻</button>
      </div>
    </div>
    <div className="scenario-values">
      <div><span>{copy.text9}</span><strong>{current.protected.toFixed(1)}%</strong></div>
      <div><span>{copy.text10}</span><strong>{current.exposed.toFixed(1)}%</strong></div>
    </div>
    <div className="scenario-liveline" role="img" aria-label={copy.chartDescription}>
      <Liveline data={series[0].data} value={current.protected} series={series}
        time={Math.max(.01, progress * 100)} timeRange={[-8, 320]} valueRange={[45, 90]}
        window={328} theme="light" grid badge={false} fill={false} pulse={false}
        momentum={false} scrub={false} referenceLine={{ value: 70, label: copy.actLabel }}
        formatValue={v => `${v.toFixed(1)}%`} formatTime={() => ''}
        padding={{ top: 28, bottom: 20, left: 12, right: 50 }} />
    </div>
    <label className="scenario-scrub"><span>{copy.scrubLabel}</span><input type="range" min="0" max={DURATION} step="10" defaultValue="0" aria-label={copy.scrubLabel} onChange={e=>controls.current.seek(Number(e.target.value))}/><span>{copy.compressedTime}</span></label>
    <ol className="scenario-log" aria-label={copy.logLabel}>
      {[{time:copy.actTime,text:copy.actLog,at:1},{time:copy.settleTime,text:copy.settleLog,at:3},{time:copy.liquidateTime,text:copy.liquidateLog,at:4}].map((event,i)=><li key={event.time} data-reached={state.phase>=event.at} className={i===2?'danger':''}><time>{event.time}</time><span>{event.text}</span></li>)}
    </ol>
  </div>;
}
