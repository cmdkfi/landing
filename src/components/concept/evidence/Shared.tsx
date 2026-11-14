import {proof,visual,market,venue} from '../../../content/landing';
export {proof,visual,market,venue};
export function Research(){return <div className="research">{visual.researchCards.map((c,i)=><article key={c.title}><p className="eyebrow">{c.eyebrow}</p><h2>{c.title}</h2><p>{i===0?market.evidence[0]:venue.evidence[0]}</p>{i===0&&<p className="muted">{market.evidence[3]}</p>}</article>)}</div>}
export function Caveats(){return <details className="caveats"><summary>{visual.researchDetails}</summary>{[...market.evidence.slice(1,3),venue.evidence[1],market.honesty,venue.limit].map((p,i)=><p key={i}>{p}</p>)}</details>}
export function Resources(){return <><div className="resources">{proof.links.map(l=><a href={l.href} key={l.label}><strong>{l.label} ↗</strong><p>{l.line}</p></a>)}</div><p className="built">{proof.builtOn}</p></>}
