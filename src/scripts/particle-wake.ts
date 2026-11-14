import { motionNow } from './motion-clock';
import * as THREE from 'three';

// ASCII wake interaction adapted from Bencho's displayed AsciiWake source:
// https://bencho.dev/?c=ascii-wake&theme=light
// Keep the reference's heat, cooling, glyph ramp, lean and press-ring timing.
const CELL_X=8.68, CELL_Y=11.48, RADIUS=12+.6*58, TRAIL=1.2, RING_SECONDS=2.2;
const ramp=[' ','.',':','-','=','+','*','#','%','@'];
let cols=0,rows=0,heat=new Float32Array(0),last=0,near=0,inside=false;
let pointer={x:-10000,y:-10000}, previous:{x:number;y:number}|undefined;
let rings:{x:number;y:number;t:number}[]=[];
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function resizeField(){
  const w=Math.ceil(innerWidth/CELL_X),h=Math.ceil(innerHeight/CELL_Y);
  if(w===cols&&h===rows)return;
  cols=w;rows=h;heat=new Float32Array(cols*rows);previous=undefined;
}
function stamp(x:number,y:number){
  for(let j=Math.max(0,Math.floor((y-RADIUS)/CELL_Y));j<Math.min(rows,Math.ceil((y+RADIUS)/CELL_Y));j++){
    for(let i=Math.max(0,Math.floor((x-RADIUS)/CELL_X));i<Math.min(cols,Math.ceil((x+RADIUS)/CELL_X));i++){
      const q=(((i+.5)*CELL_X-x)**2+((j+.5)*CELL_Y-y)**2)/(RADIUS*RADIUS);
      if(q<1){const k=j*cols+i;heat[k]=Math.min(1,heat[k]+.5*(1-q)**2);}
    }
  }
}
function advance(now:number){
  resizeField();
  const dt=Math.min(.05,Math.max(0,now-last));last=now;
  const keep=Math.exp(-dt*3/TRAIL),off=reduced();
  for(let k=0;k<heat.length;k++){const h=heat[k]*keep;heat[k]=off||h<.003?0:h;}
  near+=((inside&&!off?1:0)-near)*(1-Math.pow(.004,dt));
  rings=off?[]:rings.filter(r=>now-r.t<RING_SECONDS);
}
export function attachParticleWake(surface:HTMLElement){
  const leave=()=>{inside=false;previous=undefined;};
  const move=(e:PointerEvent)=>{
    if(reduced()||e.pointerType==='touch'||e.target instanceof Element&&e.target.closest('a,button,input')){leave();return;}
    advance(motionNow()/1000);
    const next={x:e.clientX,y:e.clientY},from=previous??next;
    const steps=Math.max(1,Math.ceil(Math.hypot(next.x-from.x,next.y-from.y)/(RADIUS/3)));
    for(let k=1;k<=steps;k++)stamp(from.x+(next.x-from.x)*k/steps,from.y+(next.y-from.y)*k/steps);
    pointer=next;previous=next;inside=true;
  };
  const down=(e:PointerEvent)=>{
    if(reduced()||e.pointerType==='touch'||e.target instanceof Element&&e.target.closest('a,button,input'))return;
    rings.push({x:e.clientX,y:e.clientY,t:motionNow()/1000});rings=rings.slice(-8);
  };
  surface.addEventListener('pointerenter',move,{passive:true});surface.addEventListener('pointermove',move,{passive:true});surface.addEventListener('pointerdown',down,{passive:true});surface.addEventListener('pointerleave',leave);window.addEventListener('blur',leave);
  return ()=>{surface.removeEventListener('pointerenter',move);surface.removeEventListener('pointermove',move);surface.removeEventListener('pointerdown',down);surface.removeEventListener('pointerleave',leave);window.removeEventListener('blur',leave);leave();heat.fill(0);rings=[];};
}
export function createWakeLayer(){
  resizeField();
  const canvas=document.createElement('canvas');canvas.width=400;canvas.height=40;
  const ctx=canvas.getContext('2d')!;ctx.fillStyle='#fff';ctx.font='500 40px ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace';ctx.textAlign='center';ctx.textBaseline='middle';
  ramp.forEach((glyph,i)=>ctx.fillText(glyph,i*40+20,20));
  const atlas=new THREE.CanvasTexture(canvas);atlas.generateMipmaps=false;atlas.minFilter=THREE.LinearFilter;
  const texture=()=>{const t=new THREE.DataTexture(heat,cols,rows,THREE.RedFormat,THREE.FloatType);t.needsUpdate=true;return t;};
  let field=texture();
  const uniforms={wakeHeat:{value:field},wakeFieldSize:{value:new THREE.Vector2(cols,rows)},wakePointer:{value:new THREE.Vector3()},wakeRings:{value:Array.from({length:8},()=>new THREE.Vector3(-10000,-10000,10))},wakeDeal:{value:0},wakeResolution:{value:new THREE.Vector2(1,1)},wakeOrigin:{value:new THREE.Vector2()},wakeAtlas:{value:atlas}};
  return {uniforms,update(canvas:HTMLCanvasElement){
    const now=motionNow()/1000;advance(now);
    if(field.image.data!==heat){field.dispose();field=texture();uniforms.wakeHeat.value=field;}
    field.needsUpdate=true;
    const rect=canvas.getBoundingClientRect();
    uniforms.wakeFieldSize.value.set(cols,rows);
    uniforms.wakeResolution.value.set(rect.width,rect.height);
    uniforms.wakeOrigin.value.set(rect.left,-rect.bottom);
    uniforms.wakePointer.value.set(pointer.x,pointer.y,reduced()?0:near);
    uniforms.wakeDeal.value=Math.floor(now/.07);
    uniforms.wakeRings.value.forEach((v,i)=>{const r=rings[i];if(r)v.set(r.x,r.y,now-r.t);else v.set(-10000,-10000,10);});
  },dispose(){atlas.dispose();field.dispose();}};
}
export const wakeVertex=`
  uniform sampler2D wakeHeat; uniform vec2 wakeFieldSize;
  uniform vec3 wakePointer; uniform vec3 wakeRings[8]; uniform float wakeDeal;
  uniform vec2 wakeResolution,wakeOrigin;
  vec2 wakeClient(vec2 pixel){return (pixel+wakeOrigin)*vec2(1.,-1.);}
  vec2 wakeCell(vec2 pixel){return floor(wakeClient(pixel)/vec2(8.68,11.48));}
  vec2 wakeCenter(vec2 pixel){vec2 cell=wakeCell(pixel);return (cell+.5+vec2(mod(cell.y,2.)*.5,0.))*vec2(8.68,11.48);}
  float wakeSeed(vec2 cell){return cell.y*wakeFieldSize.x+cell.x;}
  float wakeNoise(float key){
    uint h=uint(key)*374761393u+uint(wakeDeal)*668265263u;
    h=(h^(h>>13u))*1274126177u;
    return float(h^(h>>16u))/4294967296.;
  }
  float wakeIndex(float h,float key){
    float u=min(1.,h)*9.+.5;
    if(h>.04)u+=(wakeNoise(key)-.5)*1.6*min(1.,h*2.);
    return h<=.04?1.:clamp(floor(u),1.,9.);
  }
  float wakeBlend(float index){return step(1.5,index);}
  vec3 wakeAt(vec2 pixel){
    vec2 cell=wakeCell(pixel),center=wakeCenter(pixel);
    float h=texture2D(wakeHeat,(cell+.5)/wakeFieldSize).r;
    vec2 delta=wakePointer.xy-center;
    float d2=dot(delta,delta),q=d2/(46.8*46.8);
    if(q<1.)h=max(h,.95*wakePointer.z*(1.-q)*(1.-q));
    for(int i=0;i<8;i++){
      float p=clamp(wakeRings[i].z/2.2,0.,1.);
      float radius=8.+(1.-pow(1.-p,3.))*260.;
      float amp=.6*(1.-p)*(1.-p)*min(1.,p*6.);
      float d=(length(center-wakeRings[i].xy)-radius)/24.;
      if(abs(d)<2.5)h+=amp*exp(-d*d);
    }
    float far=93.6,f=max(0.,1.-d2/(far*far)),distance=sqrt(d2);
    float lean=min(distance*.6,14.*.4*wakePointer.z*f*f);
    vec2 pull=delta/max(distance,.001)*lean*vec2(1.,-1.);
    return vec3(pull,h);
  }
  vec2 wakePosition(vec2 pixel,vec3 effect){
    // The field stays attached to the posed 3D surface, with a fixed halftone grid.
    return wakeCenter(pixel)*vec2(1.,-1.)-wakeOrigin+effect.xy;
  }
`;
export const wakeFragment=`
  uniform sampler2D wakeAtlas;
  float wakeMask(vec2 uv,float seed,float index){
    if(index<1.5)return 1.-smoothstep(.36,.44,length(uv-.5));
    return texture2D(wakeAtlas,vec2((index+uv.x)/10.,uv.y)).a;
  }
`;
