import * as THREE from 'three';
import { createWakeLayer,wakeVertex,wakeFragment } from './particle-wake';
import BeamCompositor from './reference-light/postfx/BeamCompositor';
import { LightProbeGenerator } from 'three/addons/lights/LightProbeGenerator.js';
import LightGradient from './reference-light/objects/LightGradient';

/** The reference's HDR volume + six-level bloom, isolated from the particle hand. */
export function createHandLight(renderer:THREE.WebGLRenderer){
  let compositor:BeamCompositor|undefined,gradient:LightGradient|undefined;
  let width=1,height=1,probeStarted=false,disposed=false;
  const wake=createWakeLayer();
  const probe=new THREE.LightProbe();
  const probeTarget=new THREE.WebGLCubeRenderTarget(64);
  const probeCamera=new THREE.CubeCamera(.1,50,probeTarget);

  const leftTarget=new THREE.WebGLRenderTarget(1,1);
  const handMask=new THREE.WebGLRenderTarget(1,1);
  const backdrop=document.createElement('canvas');
  backdrop.className='hands-light-backdrop';
  backdrop.setAttribute('aria-hidden','true');
  const backdropContext=backdrop.getContext('2d');
  renderer.domElement.closest('.hands-sticky')?.append(backdrop);
  return {
    resize(w:number,h:number){width=w;height=h;leftTarget.setSize(w,h);handMask.setSize(w,h);backdrop.width=w;backdrop.height=h;compositor?.setSize(w,h,renderer.getPixelRatio());},
    render(world:THREE.Scene,view:THREE.PerspectiveCamera,point:THREE.Vector2,phase:number,light:THREE.SpotLight,left:THREE.Object3D,right:THREE.Object3D,time:number){
      if(!compositor){
        compositor=new BeamCompositor(light,new THREE.Box3(new THREE.Vector3(-12,-8,-4.5),new THREE.Vector3(12,7,2)),{width,height,pixelRatio:renderer.getPixelRatio()});
        gradient=new LightGradient(light,compositor.beam.material.uniforms,{blueSpread:3});
        compositor.screenMaterial.uniforms.tLeft={value:leftTarget.texture};
        compositor.screenMaterial.uniforms.uContact={value:new THREE.Vector2()};
        compositor.screenMaterial.uniforms.uContactStrength={value:0};
        compositor.screenMaterial.uniforms.uContactAspect={value:1};
        compositor.screenMaterial.uniforms.tHandMask={value:handMask.texture};
        compositor.screenMaterial.uniforms.uForegroundOnly={value:0};
        for(const layer of [compositor.particlesFine,compositor.particlesMedium]){
          Object.assign(layer.material.uniforms,wake.uniforms);
          layer.material.uniforms.wakeDpr={value:renderer.getPixelRatio()};
          layer.material.vertexShader='uniform float wakeDpr;\n'+wakeVertex+'\nvarying float vWake,vWakeSeed;\n'+layer.material.vertexShader;
          layer.material.vertexShader=layer.material.vertexShader.replace('gl_Position = projectionMatrix * mvPosition;',`gl_Position = projectionMatrix * mvPosition;
            vec2 screen=(gl_Position.xy/gl_Position.w*.5+.5)*wakeResolution;
            vec3 effect=wakeAt(screen);
            vWakeSeed=wakeSeed(wakeCell(screen));vWake=wakeIndex(effect.z,vWakeSeed);
            gl_Position.xy+=(wakePosition(screen,effect)-screen)*2./wakeResolution*gl_Position.w;
            gl_PointSize=mix(gl_PointSize,14.*wakeDpr,wakeBlend(vWake));`);
          layer.material.fragmentShader=wakeFragment+'\nvarying float vWake,vWakeSeed;\n'+layer.material.fragmentShader;
          layer.material.fragmentShader=layer.material.fragmentShader.replace('if (alpha <= 0.01) discard;', 'alpha=mix(alpha,wakeMask(vec2(gl_PointCoord.x,1.-gl_PointCoord.y),vWakeSeed,vWake),step(1.5,vWake)); if (alpha <= 0.01) discard;');
          layer.material.uniforms.uResolution={value:new THREE.Vector2(width*renderer.getPixelRatio(),height*renderer.getPixelRatio())};
        }
        compositor.screenMaterial.transparent=true;
        compositor.screenMaterial.blending=THREE.NormalBlending;
      }
      compositor.screenMaterial.uniforms.uContact.value.copy(point);
      compositor.screenMaterial.uniforms.uContactStrength.value=phase;
      compositor.screenMaterial.uniforms.uContactAspect.value=width/height;
      right.visible=false;
      renderer.setRenderTarget(leftTarget);renderer.clear();renderer.render(world,view);
      right.visible=true;left.visible=false;
      renderer.setRenderTarget(handMask);renderer.clear();renderer.render(world,view);
      for(const layer of [compositor.particlesFine,compositor.particlesMedium])layer.material.uniforms.uResolution.value.set(width*renderer.getPixelRatio(),height*renderer.getPixelRatio());
      wake.update(renderer.domElement);
      compositor.screenMaterial.uniforms.uForegroundOnly.value=-1;
      compositor.update(time);compositor.render(renderer,world,view);
      // Keep light and dust beneath the dial; only the hand silhouettes overlay it.
      backdropContext?.clearRect(0,0,width,height);
      backdropContext?.drawImage(renderer.domElement,0,0,width,height);
      compositor.screenMaterial.uniforms.uForegroundOnly.value=1;
      renderer.setRenderTarget(null);renderer.render(compositor.fsScene,compositor.postCamera);
      compositor.particlesFine.points.removeFromParent();compositor.particlesMedium.points.removeFromParent();
      left.visible=true;
      if(!probeStarted){
        probeStarted=true;
        right.getObjectByName('middle-finger-phalanx-proximal')!.getWorldPosition(probeCamera.position);
        compositor.captureProbe(renderer,world,probeCamera,[left,right]);
        LightProbeGenerator.fromCubeRenderTarget(renderer,probeTarget).then(result=>{
          if(disposed)return;probe.sh.copy(result.sh);probe.intensity=3;world.add(probe);
        });
      }
    },
    dispose(){disposed=true;backdrop.remove();handMask.dispose();probe.removeFromParent();probeTarget.dispose();leftTarget.dispose();wake.dispose();compositor?.dispose();gradient?.texture.dispose();}
  };
}
