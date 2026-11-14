import { useCallback, useState } from 'react';
import { Stage } from './kit/stage';
import { useReducedMotion } from './kit/reduced-motion';
import { Roll } from './kit/motion/Roll';
import { Check } from './kit/parts/Check';
import { Row } from './kit/parts/Row';
import type { Act } from './kit/act';
import BorrowSandbox from '../BorrowSandbox';
import './borrow-show.css';
import { keepWordsTogether } from '../../../utils/typography';

type Scene = { beat: number };
const opening = { beat: 0 }, poster = { beat: 4 };
// Payout-flow's retained composition and overlapping arrivals, adapted to a loan.
const script = async (a: Act<Scene>) => {
  await a.wait(1800); a.mark('limits'); a.put({ beat: 1 });
  await a.wait(2600); a.mark('approve'); a.put({ beat: 2 });
  await a.wait(2200); a.mark('open'); a.put({ beat: 3 });
  await a.wait(2200); a.mark('funded'); a.put({ beat: 4 });
  await a.wait(2200);
};
const labels = ['Choose your loan', 'Review your limits', 'Approve the rules', 'Opening position', 'Your position is open'];
export default function BorrowShow() {
  const reducedMotion = useReducedMotion();
  const [paused, setPaused] = useState(false), [ended, setEnded] = useState(false);
  const play = useCallback(async (a: Act<Scene>) => { setEnded(false); await script(a); setEnded(true); }, []);
  const [manual, setManual] = useState(false), [run, setRun] = useState(0);
  return <div className="borrow-presentation" data-show-paused={paused}>
    <div className="borrow-show-controls" aria-label="Borrow demo controls">
      <button type="button" aria-pressed={!manual} onClick={() => setManual(false)}>Watch demo</button>
      <button type="button" aria-pressed={manual} onClick={() => setManual(true)}>Try yourself</button>
      {!manual && <><button type="button" disabled={ended || reducedMotion} onClick={() => setPaused(p => !p)}>{paused ? 'Resume' : 'Pause'}</button><button type="button" onClick={() => { setPaused(false); setEnded(false); setRun(n => n + 1); }}>Replay ↻</button></>}
    </div>
    <div hidden={manual}>
      <Stage<Scene> key={run} width={620} height={580} compact={{below: 500,width:358,height:620}}
        initial={opening} poster={poster} play="once" script={play} greys="cool" fidelity="realistic"
        accent="#267855" className="borrow-show" tokens={{'--ss-font':'var(--font-sans, Arial, sans-serif)','--ss-canvas':'#fff','--ss-surface':'#fff'}}>
        {s => <div className="borrow-show-body">
          <div className="borrow-show-label">Illustrative loan · no real funds</div>
          <div className="borrow-show-title"><Roll>{keepWordsTogether(labels[s.beat])}</Roll></div>
          <div className="borrow-show-loan">
            <span>Collateral</span><strong>0.50 ETH</strong><span>Morpho · Base Sepolia</span>
          </div>
          <div className="borrow-show-limits" data-in={s.beat >= 1 || undefined}>
            <div><strong>50%</strong><span>Target LTV</span></div><div><strong>70%</strong><span>Agent acts</span></div><div><strong>86%</strong><span>Liquidation</span></div>
          </div>
          <div className="borrow-show-progress">
            <Row title="Agent rules" meta={<Roll variant="fade">{s.beat >= 2 ? 'Approved' : 'Review'}</Roll>} lead={<Check on={s.beat >= 2} size={16}/>}/>
            <Row title="ETH → WETH" meta={<Roll variant="fade">{s.beat >= 3 ? 'Deposited' : 'Ready'}</Roll>} lead={<Check on={s.beat >= 3} size={16}/>}/>
            <Row title="USDC to your wallet" meta={<Roll variant="fade">{s.beat >= 4 ? 'Received' : 'Pending'}</Roll>} lead={<Check on={s.beat >= 4} size={16}/>}/>
          </div>
          <div className="borrow-show-result" data-in={s.beat >= 4 || undefined}>
            <span><Roll variant="fade">{s.beat >= 4 ? 'Received in your wallet' : 'You borrow'}</Roll></span><strong>802.5 <small>USDC</small></strong><span><Roll variant="fade">{s.beat >= 4 ? '50% LTV · agent active' : '50% starting LTV'}</Roll></span>
          </div>
          <div className="borrow-show-foot">Simulation only. Protection is not guaranteed.</div>
        </div>}
      </Stage>
    </div>
    <div hidden={!manual}><BorrowSandbox/></div>
  </div>;
}
