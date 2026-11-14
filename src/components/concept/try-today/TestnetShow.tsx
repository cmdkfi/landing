import {useCallback,useState} from 'react';
import {Stage} from '../borrow-show/kit/stage';
import {Roll} from '../borrow-show/kit/motion/Roll';
import {Row} from '../borrow-show/kit/parts/Row';
import {Check} from '../borrow-show/kit/parts/Check';
import type {Act} from '../borrow-show/kit/act';
import '../borrow-show/borrow-show.css';
type Scene={beat:number};
const titles=['Choose your loan','Confirm in your wallet','Monitor your position'];
export default function TestnetShow(){
 const [run,setRun]=useState(0),[paused,setPaused]=useState(false),[ended,setEnded]=useState(false);
 const play=useCallback(async(a:Act<Scene>)=>{setEnded(false);await a.wait(3000);a.mark('wallet');a.put({beat:1});await a.wait(4000);a.mark('position');a.put({beat:2});await a.wait(4000);setEnded(true)},[]);
 return <div className="borrow-presentation testnet-show" data-show-paused={paused}>
 <div className="borrow-show-controls"><button onClick={()=>{setRun(n=>n+1);setPaused(false)}}>Watch demo</button><button disabled={ended} onClick={()=>setPaused(v=>!v)}>{paused?'Resume':'Pause'}</button></div>
 <Stage<Scene> key={run} width={620} height={460} compact={{below:500,width:358,height:500}} initial={{beat:0}} poster={{beat:2}} play="once" script={play} greys="cool" fidelity="realistic" className="borrow-show" tokens={{'--ss-font':'Mluvka, sans-serif','--ss-canvas':'#fff','--ss-surface':'#fff'}}>
 {s=><div className="borrow-show-body"><div className="borrow-show-label">Testnet walkthrough · illustrative preview</div><div className="borrow-show-title"><Roll>{titles[s.beat]}</Roll></div>
 <div className="borrow-show-loan"><img src="/token-icons/eth.svg" width="28" height="28" alt=""/><strong>0.50 ETH</strong><span>Morpho · Base Sepolia</span></div>
 <div className="borrow-show-progress">
 <Row title="Choose ETH → USDC" lead={<Check on={s.beat>=0} size={16}/>} meta="50% starting LTV"/>
 <Row title="Review limits & sign" lead={<Check on={s.beat>=2} size={16}/>} meta={<Roll>{s.beat===0?'Your wallet':s.beat===1?'Confirm permissions':'Confirmed'}</Roll>}/>
 <Row title="Monitor loan & agent actions" lead={<Check on={s.beat>=2} size={16}/>} meta={<Roll>{s.beat>=2?'Position open':'Next'}</Roll>}/>
 </div><div className="borrow-show-result" data-in={s.beat>=2||undefined}><span><Roll>{s.beat>=2?'Test USDC received':'You borrow'}</Roll></span><strong>800 <small>USDC</small></strong></div>
 <div className="borrow-show-foot">Connect and sign only in the testnet app. No real funds.</div></div>}
 </Stage></div>
}
