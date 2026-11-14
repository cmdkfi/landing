import * as THREE from 'three';
import { createWakeLayer, wakeVertex } from './particle-wake';

/** A separate depth layer keeps the interactive atmosphere behind the hands and copy. */
export function createParticleBackdrop(host:HTMLElement, surface:HTMLElement) {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:false,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1));
  renderer.setClearColor(0xffffff,0);host.append(renderer.domElement);
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(40,1,.1,40);camera.position.z=12;
  const count=innerWidth<600?18700:57200;
  const positions=new Float32Array(count*3), seeds=new Float32Array(count), colors=new Float32Array(count*3);
  let state=7159;
  const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
  const palette=['#aeb5c0','#bac1cb','#c6ccd5','#d1d7df','#dce1e8','#e7eaf0'];
  const ink=new THREE.Color();
  // Keep only the low, depth-layered particle bed; the upper scene stays clear.
  for(let i=0;i<count;i++) {
    let x=(random()-.5)*3.5;
    const z=-8+random()*13;
    const depth=(12-z)/12;
    const y=(-.84+Math.sin(x*5)*.10+Math.pow(random(),2)*.34)*depth;
    x*=depth;
    positions.set([x,y,z],i*3);seeds[i]=random();
    ink.set(palette[Math.floor(Math.pow(random(),1.5)*palette.length)]).convertLinearToSRGB();
    const distanceFade=THREE.MathUtils.clamp((-z-1)/28,0,.24);
    ink.lerp(new THREE.Color(.91,.93,.96),distanceFade);
    colors.set([ink.r,ink.g,ink.b],i*3);
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
  geometry.setAttribute('seed',new THREE.BufferAttribute(seeds,1));
  const uniforms={time:{value:0},area:{value:new THREE.Vector2(8,4.4)},dpr:{value:renderer.getPixelRatio()},pointer:{value:new THREE.Vector2(5,5)},pointerOn:{value:0},wave:{value:new THREE.Vector2()},waveAge:{value:10},opacity:{value:1}};
  const wake=createWakeLayer();Object.assign(uniforms,wake.uniforms);
  const glyphs='NEARHACKATHON0123456789';
  const atlasCanvas=document.createElement('canvas');
  atlasCanvas.width=glyphs.length*32;atlasCanvas.height=32;
  const ctx=atlasCanvas.getContext('2d')!;
  ctx.fillStyle='#fff';ctx.font='600 26px monospace';
  ctx.textAlign='center';ctx.textBaseline='middle';
  [...glyphs].forEach((glyph,i)=>ctx.fillText(glyph,i*32+16,16));
  const glyphAtlas=new THREE.CanvasTexture(atlasCanvas);
  glyphAtlas.generateMipmaps=false;glyphAtlas.minFilter=THREE.LinearFilter;
  Object.assign(uniforms,{glyphAtlas:{value:glyphAtlas}});
  const material=new THREE.ShaderMaterial({
    transparent:true,depthWrite:false,uniforms,
    vertexShader:`
      ${wakeVertex}
      varying float vWake;
      attribute float seed;
      attribute vec3 color;
      varying vec3 vColor;
      uniform float time,dpr,pointerOn,waveAge,opacity;
      uniform vec2 area,pointer,wave;
      varying float vAlpha,vTone;
      void main(){
        vec3 p=position;
        float phase=seed*6.2831853;
        p.x+=sin(p.y*2.8+time*.15+phase*.3)*.012;
        p.y+=sin(time*.12+phase)*.008;
        p.z+=sin(time*.17+p.y*2.+phase)*.08;
        p.xy*=area;
        vec4 view=modelViewMatrix*vec4(p,1.);
        gl_Position=projectionMatrix*view;
        gl_PointSize=clamp((6.+seed*2.)*dpr*(12./-view.z),4.,10.*dpr);
        vec2 screen=(gl_Position.xy/gl_Position.w*.5+.5)*wakeResolution;
        vec3 effect=wakeAt(screen);
        vWake=wakeIndex(effect.z,wakeSeed(wakeCell(screen)));
        gl_Position.xy+=(wakePosition(screen,effect)-screen)*2./wakeResolution*gl_Position.w;
        gl_PointSize=mix(gl_PointSize,14.*dpr,wakeBlend(vWake));
        float copySpace=1.;
        float depthFade=mix(.78,1.,clamp((position.z+8.)/16.,0.,1.));
        vAlpha=(.65+seed*.35)*depthFade*copySpace*opacity;
        vColor=color;
        vTone=wakeSeed(wakeCell(screen));
      }`,
    fragmentShader:`
      uniform sampler2D glyphAtlas;
      varying float vWake;
      varying float vAlpha,vTone;
      varying vec3 vColor;
      void main(){
        vec2 uv=vec2(gl_PointCoord.x,1.-gl_PointCoord.y);
        float glyph=mod(vTone*7.,23.);
        float edge=texture2D(glyphAtlas,vec2((glyph+uv.x)/23.,uv.y)).a;
        vec3 ink=mix(vColor,vec3(.34,.38,.45),step(1.5,vWake));
        gl_FragColor=vec4(ink,edge*vAlpha);
      }`,
  });
  const skyUniforms={time:uniforms.time,opacity:{value:1},drift:{value:new THREE.Vector2()},travel:{value:0}};
  const skyGeometry=new THREE.PlaneGeometry(2,2);
  const skyMaterial=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,transparent:true,uniforms:skyUniforms,
    vertexShader:`varying vec2 uvScene;void main(){uvScene=uv;gl_Position=vec4(position.xy,.999,1.);}`,
    fragmentShader:`
      varying vec2 uvScene;uniform float time,opacity,travel;uniform vec2 drift;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1)),f.x),f.y);}
      float fbm(vec2 p){return noise(p)*.55+noise(p*2.03)*.28+noise(p*4.07)*.13+noise(p*8.1)*.06;}
      void main(){
        vec2 p=(uvScene-.5)/(1.+travel*.13)+.5+drift;
        vec3 c=mix(vec3(242./255.,244./255.,248./255.),vec3(1.),smoothstep(0.,1.,uvScene.y));
        float haze=fbm(p*4.+vec2(time*.007,0.));
        c+=vec3((haze-.5)*.035)*sin(uvScene.y*3.14159265);
        c+=(hash(gl_FragCoord.xy)-.5)*.009*sin(uvScene.y*3.14159265);
        gl_FragColor=vec4(c,opacity);
      }`});
  const sky=new THREE.Mesh(skyGeometry,skyMaterial);sky.frustumCulled=false;sky.renderOrder=-1;scene.add(sky);
  const cloud=new THREE.Points(geometry,material);cloud.frustumCulled=false;scene.add(cloud);
  let frame=0,last=0,time=0,visible=true,disposed=false,waveStart=-100;
  let travel=0,targetTravel=0;
  const gaze=new THREE.Vector3();
  const targetPointer=new THREE.Vector2(5,5);let pointerActive=0;
  function draw(now:number){
    frame=0;if(disposed)return;
    const dt=Math.min(.04,last?(now-last)/1000:0);last=now;
    if(!reduced.matches)time+=dt;
    uniforms.time.value=time;wake.update(renderer.domElement);
    uniforms.pointer.value.lerp(targetPointer,1-Math.exp(-dt*12));
    uniforms.pointerOn.value+=(pointerActive-uniforms.pointerOn.value)*(1-Math.exp(-dt*10));
    uniforms.waveAge.value=time-waveStart;
    travel+=(targetTravel-travel)*(reduced.matches?1:1-Math.exp(-dt*7));
    const motion=reduced.matches?0:1;
    const px=pointerActive?uniforms.pointer.value.x:0,py=pointerActive?uniforms.pointer.value.y:0;
    camera.position.set(motion*(Math.sin(time*.12)*.22+px*.38+Math.sin(travel*2.3)*.8),motion*(Math.sin(time*.09)*.12+py*.22-travel*.35),12-motion*travel*3.2);
    gaze.set(motion*(-.25*travel+px*.1),motion*(py*.08+travel*.2),-3);
    camera.lookAt(gaze);
    skyUniforms.drift.value.set(camera.position.x*.025,camera.position.y*.025);skyUniforms.travel.value=travel;
    renderer.render(scene,camera);
    if(visible&&!document.hidden&&!reduced.matches&&skyUniforms.opacity.value>.001)frame=requestAnimationFrame(draw);
    else last=0;
  }
  function start(){if(!frame&&!disposed)frame=requestAnimationFrame(draw);}
  function point(event:PointerEvent){
    const rect=host.getBoundingClientRect();
    return new THREE.Vector2((event.clientX-rect.left)/rect.width*2-1,1-(event.clientY-rect.top)/rect.height*2);
  }
  function move(event:PointerEvent){if(reduced.matches)return;targetPointer.copy(point(event));pointerActive=1;start();}
  function leave(){pointerActive=0;}
  function pulse(event:PointerEvent){
    if(reduced.matches||(event.target as HTMLElement).closest('a,button,input,select,textarea'))return;
    uniforms.wave.value.copy(point(event));waveStart=time;start();
  }
  surface.addEventListener('pointermove',move,{passive:true});surface.addEventListener('pointerleave',leave);surface.addEventListener('pointerdown',pulse,{passive:true});surface.addEventListener('pointerup',leave);
  function resize(){
    const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;
    renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();
    const halfHeight=Math.tan(THREE.MathUtils.degToRad(20))*12;
    uniforms.area.value.set(halfHeight*camera.aspect,halfHeight);start();
  }
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)start();});observer.observe(host);
  function motionChange(){pointerActive=0;uniforms.pointerOn.value=0;waveStart=-100;start();}
  reduced.addEventListener('change',motionChange);document.addEventListener('visibilitychange',start);resize();
  return {
    update(reveal:number,progress=0,hideWave=0){cloud.visible=hideWave<1;uniforms.opacity.value=(1-reveal)*(1-hideWave);skyUniforms.opacity.value=1-reveal;targetTravel=Math.min(1,progress/.53);start();},
    dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);observer.disconnect();resizeObserver.disconnect();reduced.removeEventListener('change',motionChange);document.removeEventListener('visibilitychange',start);surface.removeEventListener('pointermove',move);surface.removeEventListener('pointerleave',leave);surface.removeEventListener('pointerdown',pulse);surface.removeEventListener('pointerup',leave);geometry.dispose();material.dispose();glyphAtlas.dispose();wake.dispose();skyGeometry.dispose();skyMaterial.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();}
  };
}
