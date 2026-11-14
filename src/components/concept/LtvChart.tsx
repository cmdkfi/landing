import './borrow-show/borrow-show.css';
import { useEffect, useRef, useState } from 'react';
import { counterMeasure as copy } from '../../content/counter-measure';
import { DURATION, progressAt, valuesAt } from './ltv-scenario';
import './ltv-chart.css';

export default function LtvChart() {
  const root = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({ phase: 4 });
  const [progress, setProgress] = useState(3);
  useEffect(() => {
    const host = root.current?.closest('.price-protection');
    const update = () => {
      const elapsed = Number((host as HTMLElement)?.dataset.demoElapsed ?? DURATION);
      const p = progressAt(elapsed);
      setProgress(p);
      setState({ phase: p < 1 ? 0 : p === 1 ? 1 : p < 2 ? 2 : p < 3 ? 3 : 4 });
    };
    host?.addEventListener('price-demo-frame', update);
    update();
    return () => host?.removeEventListener('price-demo-frame', update);
  }, []);
  const phases = [copy.replayFalling, copy.replayActing, copy.replayRecovering, copy.replaySettled, copy.replayComplete];
  const current = valuesAt(progress);
  const protectedBuffer = Math.max(0, 86 - current.protected).toFixed(1);
  const exposedBuffer = Math.max(0, 86 - current.exposed).toFixed(1);
  const protectedStatus = current.protected >= 70 ? 'Agent acting' : current.protected > 50.1 ? 'Approaching action line' : 'At target';
  const exposedStatus = current.exposed >= 86 ? 'Eligible for liquidation' : current.exposed >= 70 ? 'Beyond action line' : current.exposed > 50.1 ? 'Risk rising' : 'At target';
  return <div className="ltv-scenario" ref={root} data-phase={state.phase}>
    <div className="scenario-values">
      <div><span>{copy.text9}</span><strong>{current.protected.toFixed(1)}%</strong><small>{protectedStatus}</small><small className="ltv-buffer">{protectedBuffer} pp to liquidation</small></div>
      <div><span>{copy.text10}</span><strong>{current.exposed.toFixed(1)}%</strong><small>{exposedStatus}</small><small className="ltv-buffer">{exposedBuffer} pp to liquidation</small></div>
    </div>
    <div className="ltv-scale" role="img" aria-label={`${copy.chartDescription} ${copy.text9}: ${current.protected.toFixed(1)}%, ${protectedBuffer} percentage points to liquidation. ${copy.text10}: ${current.exposed.toFixed(1)}%, ${exposedBuffer} percentage points to liquidation.`}>
      <div className="ltv-rail" />
      {[50, 70, 86].map((value, i) => <div key={value} className={`ltv-threshold threshold-${i}`} style={{ left: `${value}%` }}><span><b>{value}%</b><small>{[copy.scaleTarget, copy.scaleAction, copy.scaleLimit][i]}</small></span><i /></div>)}
      <div className="ltv-marker marker-protected" style={{ left: `${current.protected}%` }}><i /></div>
      <div className="ltv-marker marker-exposed" style={{ left: `${current.exposed}%` }}><i /></div>
      <span className="scale-zero">0%</span><span className="scale-hundred">100%</span>
    </div>
    <p className="scale-definition">{copy.ltvDefinition}</p>
    <div className="replay-controls">
      <p className="replay-status" role="status" aria-live="polite">{phases[state.phase]}</p>

    </div>
  </div>;
}
