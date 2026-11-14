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
    <div className="incident-plot" >
    <span className="incident-event-label">Market removed</span>
    <svg className="incident-step-chart" viewBox="0 0 600 96" role="img" aria-label={`Verified adjacent blocks ${blocks}. Assets change in ${duration} seconds; values between blocks are unknown.`}>
      <line x1="22" y1="79" x2="578" y2="79" className="chart-axis" />
      <line x1="300" y1="10" x2="300" y2="79" className="chart-event" />
      <path d="M 22 16 H 300 V 68 H 578" className="chart-step" />
      <circle cx="300" cy="16" r="4" className="chart-point" />
      <circle cx="300" cy="68" r="4" className="chart-point" />
      <text x="22" y="93">BLOCK {before.block.toLocaleString('en-US')}</text>
      <text x="300" y="93" textAnchor="middle">{duration} SECONDS</text>
      <text x="578" y="93" textAnchor="end">BLOCK {after.block.toLocaleString('en-US')}</text>
    </svg>
    {[before, after].map((point, pointIndex) => {
      const title = pointIndex === 0 ? 'Before removal' : 'After removal';
      const amount = pointIndex === 0 ? beforeAmount : afterAmount;
      const timestamp = new Date(point.time * 1000).toISOString().replace('T', ' ').replace('.000Z', ' UTC');
      const tooltipId = `incident-${index}-point-${pointIndex}`;
      return <div key={pointIndex} className={`incident-point-anchor incident-point-anchor--${pointIndex}`} onPointerEnter={event => { if (event.pointerType === 'mouse') event.currentTarget.dataset.open = 'true'; }} onPointerLeave={event => { if (!event.currentTarget.contains(document.activeElement)) delete event.currentTarget.dataset.open; }} onKeyDown={event => { if (event.key === 'Escape') delete event.currentTarget.dataset.open; }}>
        <button type="button" className="incident-point-button" aria-label={`${title}: ${exact(amount)} USDC`} aria-describedby={tooltipId} onFocus={event => { event.currentTarget.parentElement!.dataset.open = 'true'; }} onBlur={event => { delete event.currentTarget.parentElement!.dataset.open; }} onClick={event => { event.currentTarget.parentElement!.dataset.open = 'true'; }}><span /></button>
        <div id={tooltipId} role="tooltip" className="incident-point-tooltip"><strong>{title}</strong><span>{exact(amount)} USDC</span><span>{timestamp}</span><span>Block {point.block.toLocaleString('en-US')}</span></div>
      </div>;
    })}
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
