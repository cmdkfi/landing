import * as THREE from 'three';
import { createWakeLayer, wakeVertex, wakeFragment } from './particle-wake';

/** Surface samples retain bone weights, so every particle follows the fingers in 3D. */
export function createParticleHand(source: THREE.BufferGeometry) {
  const count = 46000;
  const p=source.getAttribute('position'), n=source.getAttribute('normal');
  const si=source.getAttribute('skinIndex'), sw=source.getAttribute('skinWeight');
  const indices=source.index!.array;
  const areas:number[]=[];
  const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
  let total=0, seed=9137;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(let t=0;t<indices.length;t+=3){
    a.fromBufferAttribute(p,indices[t]);b.fromBufferAttribute(p,indices[t+1]);c.fromBufferAttribute(p,indices[t+2]);
    total+=b.sub(a).cross(c.sub(a)).length()/2;areas.push(total);
  }
  const positions=new Float32Array(count*3), normals=new Float32Array(count*3);
  const skinIndices=new Uint16Array(count*4), skinWeights=new Float32Array(count*4), seeds=new Float32Array(count);
  for(let i=0;i<count;i++){
    const pick=random()*total;let lo=0,hi=areas.length-1;
    while(lo<hi){const mid=(lo+hi)>>1;if(areas[mid]<pick)lo=mid+1;else hi=mid;}
    const u=Math.sqrt(random()),v=random(), weights=[1-u,u*(1-v),u*v];
    const influences=new Map<number,number>();
    for(let j=0;j<3;j++){
      const vertex=indices[lo*3+j],w=weights[j];
      for(let k=0;k<3;k++){positions[i*3+k]+=p.array[vertex*3+k]*w;normals[i*3+k]+=n.array[vertex*3+k]*w;}
      for(let k=0;k<4;k++){const bone=si.array[vertex*4+k];influences.set(bone,(influences.get(bone)||0)+sw.array[vertex*4+k]*w);}
    }
    const best=[...influences].sort((a,b)=>b[1]-a[1]).slice(0,4), sum=best.reduce((v,x)=>v+x[1],0);
    best.forEach(([bone,w],k)=>{skinIndices[i*4+k]=bone;skinWeights[i*4+k]=w/sum;});seeds[i]=random();
  }
  const geometry=new THREE.InstancedBufferGeometry();
  geometry.setAttribute('corner',new THREE.Float32BufferAttribute([-1,-1,1,-1,1,1,-1,1],2));
  geometry.setIndex([0,1,2,0,2,3]);geometry.instanceCount=count;
  geometry.setAttribute('position',new THREE.InstancedBufferAttribute(positions,3));
  geometry.setAttribute('normal',new THREE.InstancedBufferAttribute(normals,3));
  geometry.setAttribute('skinIndex',new THREE.InstancedBufferAttribute(skinIndices,4));
  geometry.setAttribute('skinWeight',new THREE.InstancedBufferAttribute(skinWeights,4));
  geometry.setAttribute('seed',new THREE.InstancedBufferAttribute(seeds,1));
  const wake=createWakeLayer();
  const material=new THREE.ShaderMaterial({
    transparent:true,depthWrite:true,uniforms:{resolution:{value:new THREE.Vector2(1200,900)},...wake.uniforms,time:{value:0}},
    vertexShader:`
      attribute vec2 corner; attribute float seed;
      uniform vec2 resolution; uniform float time;
      varying float vWake;
      ${wakeVertex}
      varying vec2 vUv; varying float vSeed; varying float vLight; varying float vFade;
      #include <common>
      #include <skinning_pars_vertex>
      void main(){
        #include <beginnormal_vertex>
        #include <skinbase_vertex>
        #include <skinnormal_vertex>
        #include <defaultnormal_vertex>
        #include <begin_vertex>
        #include <skinning_vertex>
        float phase=seed*6.2831853;
        vec3 surfaceNormal=normalize(transformedNormal);
        vFade=smoothstep(-.15,.25,surfaceNormal.z);
        vLight=clamp(.16+.84*max(0.,dot(surfaceNormal,normalize(vec3(-.45,.75,1.)))),0.,1.);
        #include <project_vertex>
        vec2 screen=(gl_Position.xy/gl_Position.w*.5+.5)*wakeResolution;
        vec3 effect=wakeAt(screen);vWake=wakeIndex(effect.z,wakeSeed(wakeCell(screen)));
        // Preserve the true surface between interactions; only warm glyphs use the ASCII grid.
        vec2 projected=mix(screen+effect.xy,wakePosition(screen,effect),wakeBlend(vWake));
        gl_Position.xy+=(projected-screen)*2./wakeResolution*gl_Position.w;
        vec2 diameter=mix(vec2(1.2+seed*1.2+(1.-vLight)*1.2),vec2(14.),wakeBlend(vWake));
        gl_Position.xy+=corner*diameter/resolution*gl_Position.w;
        vUv=corner*.5+.5;vSeed=wakeSeed(wakeCell(screen));

      }`,
    fragmentShader:`
      ${wakeFragment}
      varying float vWake; varying vec2 vUv;varying float vSeed;varying float vLight; varying float vFade;
      void main(){
        float alpha=wakeMask(vUv,vSeed,vWake);
        if(alpha<.08)discard;
        vec3 ink=mix(vec3(.10,.12,.16),vec3(.52,.56,.63),pow(vLight,1.25));
        gl_FragColor=vec4(ink,alpha*(.94-.20*vLight)*vFade);
      }`,
  });
  return {geometry,material,update:(time:number,canvas:HTMLCanvasElement)=>{material.uniforms.time.value=time;wake.update(canvas);},resize:(w:number,h:number)=>material.uniforms.resolution.value.set(w,h),dispose:()=>{material.dispose();wake.dispose();}};
}
