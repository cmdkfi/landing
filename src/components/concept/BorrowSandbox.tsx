import { useEffect, useRef, useState } from 'react';
import { borrowDemo as c } from '../../content/borrow-demo';
import { onMotionFrame } from '../../scripts/motion-clock';
import { crashDemo, DEMO_PRICE, openDemo, positionLtv, validDeposit } from './borrow-model';
import './borrow-sandbox.css';
const money = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 2 });
export default function BorrowSandbox() {
  const [positionPage, setPositionPage] = useState(0);
  const [step, setStep] = useState(0), [amount, setAmount] = useState('0.5'), [accepted, setAccepted] = useState(false);
  const [progress, setProgress] = useState(0), [job, setJob] = useState<null | 'open' | 'crash' | 'stress'>(null);
  const [position, setPosition] = useState(openDemo(.5)), [agent, setAgent] = useState(true), [backup, setBackup] = useState(false);
  const [crashed, setCrashed] = useState(false), [logs, setLogs] = useState<string[]>([]);
  const [confirm, setConfirm] = useState<null | 'close' | 'revoke'>(null);
  const root = useRef<HTMLDivElement>(null), heading = useRef<HTMLHeadingElement>(null), didMount = useRef(false);
  const qty = Number(amount), valid = validDeposit(qty), ltv = positionLtv(position);
  useEffect(() => { if (didMount.current) heading.current?.focus({ preventScroll: true }); didMount.current = true; }, [step, confirm]);
  useEffect(() => {
    if (!job) return;
    let elapsed = 0, last: number | undefined, completed = false;
    return onMotionFrame(now => {
      if (completed) return;
      const delta = last === undefined ? 0 : now - last; last = now;
      if (!root.current?.getClientRects().length) return;
      elapsed += delta;
      const duration = job === 'open' ? 4200 : 1800;
      setProgress(Math.min(6, Math.floor(elapsed / duration * 6)));
      if (elapsed < duration) return;
      completed = true;
      setJob(null);
      if (job === 'open') { setPosition(openDemo(qty)); setLogs([c.opened]); setStep(4); }
      if (job === 'crash') { setPosition(p => crashDemo(p, agent)); setCrashed(true); setLogs(l => [agent ? c.crashLog : c.liquidation, ...l]); }
      if (job === 'stress') { setBackup(true); setLogs(l => [c.stressLog, ...l]); }
    });
  }, [job, qty, agent]);
  function reset() { setJob(null); setStep(0); setAccepted(false); setConfirm(null); setAgent(true); setBackup(false); setCrashed(false); setLogs([]); setProgress(0); }
  function start(kind: 'open' | 'crash' | 'stress') { setProgress(0); setJob(kind); if (kind === 'open') setStep(3); }
  const buttons = <div className="bs-actions"><button type="button" className="bs-secondary" onClick={() => setStep(s => s - 1)}>{c.back}</button><button type="submit" disabled={step === 0 ? !valid : !accepted}>{c.next}</button></div>;
  return <div className="borrow-sandbox" data-lenis-prevent ref={root}>
    <div className="bs-badge">{c.badge}</div>
    {step < 3 && <ol className="bs-steps">{c.steps.map((label, i) => <li key={label} aria-current={i === step ? 'step' : undefined}><span>{i + 1}</span>{label}</li>)}</ol>}
    <h3 ref={heading} tabIndex={-1}>{confirm ? confirm === 'close' ? c.closeTitle : c.revokeTitle : c.titles[step]}</h3>
    {confirm ? <div className="bs-confirm"><p>{confirm === 'close' ? c.closeNote : c.revokeNote}</p>{confirm === 'close' && <dl><div><dt>{c.repay}</dt><dd>{money(position.debt)}</dd></div><div><dt>{c.returned}</dt><dd>{position.collateral.toFixed(4)}</dd></div></dl>}<div className="bs-actions"><button className="bs-secondary" onClick={() => setConfirm(null)}>{c.cancel}</button><button onClick={() => { if (confirm === 'close') setStep(5); else { setAgent(false); setLogs(l => [c.revokeLog, ...l]); } setConfirm(null); }}>{c.confirm}</button></div></div> : <>
    {step === 0 && <form onSubmit={e => { e.preventDefault(); if (valid) setStep(1); }}>
      <div className="bs-pair"><b>ETH</b><span aria-hidden="true">→</span><b>USDC</b><small>{c.venue}</small></div>
      <details><summary>{c.catalogue}</summary><div className="bs-catalogue">{c.assets.map(([name, status], i) => <button type="button" key={name} disabled={i !== 0} aria-pressed={i === 0}>{name}<small>{status}</small></button>)}</div></details>
      <label className="bs-input">{c.deposit}<div><input aria-describedby="borrow-amount-help" type="number" inputMode="decimal" min="0.001" max="9.99" step="any" value={amount} onChange={e => setAmount(e.target.value)} required/><span>ETH</span></div></label>
      <p id="borrow-amount-help" className={!valid ? 'bs-error' : 'bs-note'}>{!valid ? c.validation : c.price}</p>
      <div className="bs-estimate"><span>{c.borrow}</span><b>{valid ? money(qty * DEMO_PRICE * .5) : '—'} USDC</b><small>50% LTV</small></div>
      <p className="bs-note">{c.rate}</p><div className="bs-actions"><button type="submit" disabled={!valid}>{c.next}</button></div>
    </form>}
    {step === 1 && <form onSubmit={e => { e.preventDefault(); if (accepted) setStep(2); }}><div className="bs-limits">{c.limits.map(([value,label]) => <div key={label}><b>{value}</b><small>{label}</small></div>)}</div><p className="bs-note">{c.preset}</p><details><summary>{c.steps[1]}</summary><ul>{c.rules.map(rule => <li key={rule}>{rule}</li>)}</ul></details><label className="bs-check"><input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)}/><span>{c.accept}</span></label>{buttons}</form>}
    {step === 2 && <><div className="bs-estimate"><b>{c.wallet}</b><span>{c.network}</span><small>{c.balance}</small></div><p>{c.walletNote}</p><dl><div><dt>{c.collateral}</dt><dd>{amount} ETH</dd></div><div><dt>{c.borrow}</dt><dd>{money(qty * DEMO_PRICE * .5)} USDC</dd></div></dl><div className="bs-actions"><button className="bs-secondary" onClick={() => setStep(1)}>{c.back}</button><button onClick={() => start('open')}>{c.create}</button></div></>}
    {step === 3 && <><ol className="bs-opening" aria-live="polite">{c.opening.map((label,i) => <li key={label}><span>{label}</span><small>{i < progress ? c.done : i === progress ? c.confirming : c.waiting}</small></li>)}</ol><p className="bs-note">{c.walletNote}</p></>}
    {step === 4 && <><div hidden={positionPage !== 0}><div className="bs-position-meta"><span>{agent ? c.active : c.revoked}</span><span>{backup ? c.backup : c.live}</span></div><div className="bs-balances"><div><small>{c.collateral}</small><b>{position.collateral.toFixed(4)}</b><small>WETH</small></div><div><small>{c.debt}</small><b>{money(position.debt)}</b><small>USDC</small></div><div><small>{c.ltv}</small><b>{ltv.toFixed(1)}%</b><small>{ltv >= 86 ? c.warning : c.safe}</small></div></div>
      <div className="bs-corridor" role="img" aria-label={`${c.ltv} ${ltv.toFixed(1)}%. ${c.limits.map(([v,l]) => `${l} ${v}`).join(', ')}`}><i style={{left: `${Math.min(100,ltv)}%`}}/></div><div className="bs-limits">{c.limits.map(([value,label]) => <div key={label}><b>{value}</b><small>{label}</small></div>)}</div>
      </div><div hidden={positionPage !== 1}>
      {job && <p role="status">{job === 'crash' ? c.runningCrash : c.runningStress}</p>}
      <div className="bs-scenarios"><button className="bs-secondary" disabled={!!job || crashed} onClick={() => start('crash')}>{c.crash}</button><button className="bs-secondary" disabled={!!job || backup || !agent || ltv >= 86} onClick={() => start('stress')}>{c.stress}</button></div>
      <details><summary>{c.crash}</summary><p className="bs-note">{c.crashNote}</p></details><details><summary>{c.stress}</summary><p className="bs-note">{c.stressNote}</p></details>
      {ltv >= 86 && <p className="bs-error">{c.liquidation}</p>}
      <details><summary>{c.recent}</summary><ul>{logs.map((log,i) => <li key={i}>{log}</li>)}</ul></details><details><summary>{c.verify}</summary><p className="bs-note">{c.verifyNote}</p></details>
      <div className="bs-actions"><button className="bs-secondary" disabled={!agent || !!job} onClick={() => setConfirm('revoke')}>{c.revoke}</button><button disabled={!!job} onClick={() => setConfirm('close')}>{c.close}</button></div>
      </div><div className="bs-actions"><button className="bs-secondary" disabled={positionPage===0} onClick={()=>setPositionPage(0)}>← Position</button><button disabled={positionPage===1} onClick={()=>setPositionPage(1)}>Actions →</button></div>
    </>}
    {step === 5 && <><p>{c.closed}</p><div className="bs-estimate"><span>{c.returned}</span><b>{position.collateral.toFixed(4)} WETH</b></div><button onClick={reset}>{c.reset}</button></>}
    </>}
    <footer><span>{c.simulated}</span><a href="https://testnet.cmdk.fi/#sandbox/start">{c.sandboxLink}</a>{step > 0 && step !== 5 && <button className="bs-reset" onClick={reset}>{c.reset}</button>}</footer>
  </div>;
}
