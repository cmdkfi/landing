import { motionScheduler } from '../../scripts/motion-clock';
import { Liveline } from 'liveline';
import histories from '../../content/incident-history.json';

interface Props {
  index: number;
  label: string;
  before: number;
  after: number;
  amountLabel: string;
  date: string;
  evidence: string;
  source: string;
  researchLabel: string;
  sourceLabel: string;
}

const caseLogos = ['/case-logos/relend.png', '/case-logos/gauntlet.svg', '/case-logos/usual.png'];

const compact = (value: number) => value >= 1e6
  ? `$${(value / 1e6).toFixed(2)}m`
  : `$${(value / 1e3).toFixed(1)}k`;
const exact = (value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function IncidentChart({ index, label, date, evidence, source, researchLabel, sourceLabel, before: beforeAmount, after: afterAmount }: Props) {
  const history = histories[index];
  const eventIndex = history.points.findIndex(point => point.time === history.eventTime);
  const before = history.points[eventIndex - 1];
  const after = history.points[eventIndex];
  const loss = before.value - after.value;
  const percentage = (loss / before.value * 100).toFixed(1);
  const duration = (after.time - before.time).toFixed(1);
  const blocks = `${before.block.toLocaleString('en-US')} → ${after.block.toLocaleString('en-US')}`;

  return <figure className="incident-chart-shell" aria-label={`${label}: vault assets fell from ${compact(before.value)} to ${compact(after.value)} across adjacent blocks.`}>
    <div className="incident-chart-topline"><div className="incident-chart-identity"><img src={caseLogos[index]} alt="" width="28" height="28" /><span>VAULT TOTAL ASSETS · USDC</span></div><time>{date}</time></div>
    <div className="incident-comparator">
      <div><span>BEFORE</span><strong>{exact(beforeAmount)}</strong></div>
      <div className="incident-comparator-loss"><span>WRITTEN OFF</span><strong>−{exact(beforeAmount - afterAmount)}</strong><small>−{percentage}%</small></div>
      <div><span>REMAINING</span><strong>{exact(afterAmount)}</strong></div>
    </div>
    <div className="incident-liveline" role="img" aria-label={`Historical block samples. Verified write-off across blocks ${blocks} in ${duration} seconds.`}>
      <Liveline frameScheduler={motionScheduler} data={history.points.slice(0, eventIndex + 1)} value={after.value}
        time={after.time}
        timeRange={[history.points[0].time, after.time + 1800]}
        window={after.time - history.points[0].time + 1800}
        theme="light" color="#4b657a" grid badge={false} fill={false}
        pulse={false} momentum={false} scrub={false} formatValue={compact}
        formatTime={t => `${new Date(t * 1000).toISOString().slice(11, 16)} UTC`}
        padding={{ top: 12, bottom: 28, left: 12, right: 58 }} />
    </div>
    <div className="incident-chart-actions">
      <span className="incident-chart-caption">Verified block samples; connecting lines are visual guides. Write-off: {duration}s across adjacent blocks.</span>
      <details className="incident-source-menu" onPointerEnter={event => { if (event.pointerType === 'mouse') event.currentTarget.open = true; }} onPointerLeave={event => { if (event.pointerType === 'mouse' && !event.currentTarget.contains(document.activeElement)) event.currentTarget.open = false; }} onKeyDown={event => { if (event.key === 'Escape') { event.currentTarget.open = false; event.currentTarget.querySelector('summary')?.focus(); } }}>
        <summary aria-label="Incident sources"><span className="incident-info-icon" aria-hidden="true">i</span></summary>
        <div className="incident-source-popover">
          <a href={evidence} target="_blank" rel="noreferrer">{researchLabel}<span aria-hidden="true"> ↗</span></a>
          <a href={source} target="_blank" rel="noreferrer">{sourceLabel}<span aria-hidden="true"> ↗</span></a>
        </div>
      </details>
    </div>
  </figure>;
}
