import { useEffect, useRef, useState } from 'react';
import { Liveline } from 'liveline';
import { counterMeasure as copy } from '../../content/counter-measure';

const protectedPath = [50, 51, 53, 56, 60, 65, 70, 58, 50, 50, 50, 50, 50];
const exposedPath = [50, 51, 53, 56, 60, 65, 70, 74, 79, 83, 86, 86, 86];

export default function LtvChart() {
  const root = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(0);
  const [step, setStep] = useState(0);
  const [end, setEnd] = useState(() => Date.now() / 1000);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    let timer: ReturnType<typeof setTimeout>;
    let index = 0;
    let visible = false;
    let finished = false;
    const tick = () => {
      if (!visible || document.hidden || finished) return;
      index += 1;
      setEnd(Date.now() / 1000);
      setStep(index);
      if (index === 12) { finished = true; setPlaying(false); return; }
      timer = setTimeout(tick, index === 6 ? 1300 : 550);
    };
    const resume = () => {
      clearTimeout(timer);
      if (visible && !document.hidden && !finished) timer = setTimeout(tick, 550);
    };
    const reduce = () => {
      if (media.matches) { clearTimeout(timer); finished = true; setStep(12); setPlaying(false); }
    };
    setEnd(Date.now() / 1000);
    setStep(0);
    setPlaying(!media.matches);
    if (media.matches) { reduce(); return; }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; resume(); }, { threshold: .35 });
    if (root.current) observer.observe(root.current);
    document.addEventListener('visibilitychange', resume);
    media.addEventListener('change', reduce);
    return () => { clearTimeout(timer); observer.disconnect(); document.removeEventListener('visibilitychange', resume); media.removeEventListener('change', reduce); };
  }, [run]);

  const points = (values: number[]) => step === 0
    ? [{ time: end - 1, value: 50 }, { time: end, value: 50 }]
    : values.slice(0, step + 1).map((value, i) => ({ time: end - (step - i) * 3, value }));
  const series = [
    { id: 'protected', label: copy.text9, color: '#4b657a', data: points(protectedPath), value: protectedPath[step] },
    { id: 'unprotected', label: copy.text10, color: '#b44440', data: points(exposedPath), value: exposedPath[step] },
  ];
  const status = step < 6 ? copy.replayFalling : step === 6 ? copy.replayActing : step < 10 ? copy.replayRecovering : copy.replayComplete;
  return <div className="ltv-live" ref={root}>
    <div className="ltv-replay-bar"><span role="status">{status}</span><button type="button" disabled={playing} onClick={() => setRun(v => v + 1)}>{playing ? copy.replayPlaying : copy.replayButton}</button></div>
    <div aria-label={copy.chartDescription} style={{ height: 'calc(100% - 42px)' }}>
      <Liveline key={run} series={series} theme="light" paused={!playing} window={40} windowStyle="text" style={{ height: 'calc(100% - 56px)' }}
        referenceLine={{ value: 70, label: copy.actLabel }}
        formatValue={value => `${value.toFixed(1)}%`} formatTime={time => `${Math.round(time - end)}s`}
        pulse={playing} momentum={false} fill={false} badge={false} degen={false}
        scrub lineWidth={2.5} padding={{ top: 28, bottom: 32, left: 12, right: 62 }} />
    </div>
  </div>;
}
