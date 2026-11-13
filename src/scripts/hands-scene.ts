import * as THREE from 'three';
import { createHandLight } from './hand-light';
import { createParticleHand } from './particle-hand';
import { smoothHand } from './smooth-hand';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function createHandsScene(host: HTMLElement) {
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  host.append(renderer.domElement);
  const lighting = createHandLight(renderer);
  const humanMaterials: THREE.MeshStandardMaterial[] = [];
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
  camera.position.set(0, -1.2, 16);
  camera.lookAt(0, -1.2, 0);
  scene.environment = null;
  const material = new THREE.MeshNormalMaterial();
  const particleHands:ReturnType<typeof createParticleHand>[]=[];
  type Rig = { root: THREE.Group; wrist: THREE.Object3D; wristSupport: THREE.Object3D; wristRest: THREE.Quaternion; basis: THREE.Quaternion; joints: { bone: THREE.Object3D; rest: THREE.Quaternion; amount: number }[] };
  let left: Rig | undefined, right: Rig | undefined, disposed = false;
  const draco=new DRACOLoader().setDecoderPath('/draco/');
  const loader = new GLTFLoader().setDRACOLoader(draco);
  async function loadHand(side: 'left' | 'right'): Promise<Rig> {
    if(side==='right'){
      const {scene:model}=await loader.loadAsync('/models/scene-hand.glb');
      model.updateMatrixWorld(true);
      const wrist=model.getObjectByName('hand')!;
      const origin=wrist.getWorldPosition(new THREE.Vector3());
      const middle=model.getObjectByName('middle001')!.getWorldPosition(new THREE.Vector3());
      const up=middle.clone().sub(origin).normalize();
      const across=model.getObjectByName('index001')!.getWorldPosition(new THREE.Vector3())
        .sub(model.getObjectByName('pinky001')!.getWorldPosition(new THREE.Vector3())).normalize();
      const normal=new THREE.Vector3().crossVectors(across,up).normalize();across.crossVectors(up,normal).normalize();
      const basis=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(across,up,normal));
      const root=new THREE.Group(),alignment=new THREE.Group();
      alignment.quaternion.copy(basis).invert();alignment.scale.setScalar(4.50/middle.distanceTo(origin));
      model.position.sub(origin);alignment.add(model);root.add(alignment);
      const joints:Rig['joints']=[];
      for(const finger of ['thumb','index','middle','ring','pinky']){
        for(let i=1;i<=3;i++){
          const bone=model.getObjectByName(`${finger}00${i}`);if(!bone)continue;
          bone.name=`${finger}${finger==='thumb'?'':'-finger'}-phalanx-${['proximal','intermediate','distal'][i-1]}`;
          joints.push({bone,rest:bone.quaternion.clone(),amount:0});
          if(finger==='index'&&i===3){const tip=new THREE.Object3D();tip.name='index-finger-tip';tip.position.y=.26;bone.add(tip);}
        }
      }
      root.updateMatrixWorld(true);
      model.traverse(object=>{if(object instanceof THREE.Mesh){
        object.castShadow=true;object.receiveShadow=true;object.frustumCulled=false;
        const skin=object.material as THREE.MeshStandardMaterial;
        humanMaterials.push(skin);
        skin.color.setRGB(1,1,1);
        skin.metalness=0;skin.roughness=1;skin.envMapIntensity=.08;skin.normalScale.set(1,1);
        if(object instanceof THREE.SkinnedMesh){
          const vertices=object.geometry.getAttribute('position');
          const wristLocal=object.worldToLocal(wrist.getWorldPosition(new THREE.Vector3()));
          const knuckleLocal=object.worldToLocal(model.getObjectByName('middle-finger-phalanx-proximal')!.getWorldPosition(new THREE.Vector3()));
          const handAxis=knuckleLocal.clone().sub(wristLocal).normalize();
          const exposure=new Float32Array(vertices.count);
          let low=Infinity,high=-Infinity;
          for(let i=0;i<vertices.count;i++){
            const along=new THREE.Vector3().fromBufferAttribute(vertices,i).dot(handAxis);
            exposure[i]=along;low=Math.min(low,along);high=Math.max(high,along);
          }
          for(let i=0;i<vertices.count;i++)exposure[i]=THREE.MathUtils.smoothstep((exposure[i]-low)/(high-low),.60,.85);
          object.geometry.setAttribute('handExposure',new THREE.BufferAttribute(exposure,1));
          skin.onBeforeCompile=shader=>{
            shader.vertexShader='attribute float handExposure; varying float vHandExposure;\n'+shader.vertexShader;
            shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvHandExposure=handExposure;');
            shader.fragmentShader='varying float vHandExposure;\n'+shader.fragmentShader;
            shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','outgoingLight*=mix(.18,1.,smoothstep(0.,.85,vHandExposure));\n#include <opaque_fragment>');
          };
          skin.customProgramCacheKey=()=> 'hand-forearm-falloff';
        }
      }});
      if(!disposed)scene.add(root);
      return {root,wrist,wristSupport:wrist,wristRest:wrist.quaternion.clone(),basis,joints};
    }
    const { scene: model } = await loader.loadAsync(`/models/hand-${side}.glb`);
    const wrist = model.getObjectByName('wrist')!;
    const middle = model.getObjectByName('middle-finger-phalanx-proximal')!;
    const index = model.getObjectByName('index-finger-phalanx-proximal')!;
    const pinky = model.getObjectByName('pinky-finger-phalanx-proximal')!;
    model.updateMatrixWorld(true);
    const origin = wrist.getWorldPosition(new THREE.Vector3());
    const up = middle.getWorldPosition(new THREE.Vector3()).sub(origin).normalize();
    const across = index.getWorldPosition(new THREE.Vector3()).sub(pinky.getWorldPosition(new THREE.Vector3())).normalize().multiplyScalar(side === 'left' ? -1 : 1);
    const normal = new THREE.Vector3().crossVectors(across, up).normalize();
    across.crossVectors(up, normal).normalize();
    const basis = new THREE.Matrix4().makeBasis(across, up, normal);
    const root = new THREE.Group();
    const alignment = new THREE.Group();alignment.quaternion.setFromRotationMatrix(basis).invert();alignment.scale.setScalar(19);
    model.position.sub(origin);alignment.add(model);root.add(alignment);
    const joints: Rig['joints'] = [];
    for (const finger of ['thumb', 'index-finger', 'middle-finger', 'ring-finger', 'pinky-finger']) {
      const names = finger === 'thumb' ? ['metacarpal','phalanx-proximal','phalanx-distal','tip'] : ['metacarpal','phalanx-proximal','phalanx-intermediate','phalanx-distal','tip'];
      let parent: THREE.Object3D = wrist;
      for (const suffix of names) {
        const bone = model.getObjectByName(`${finger}-${suffix}`)!;
        // WebXR assets store joints as siblings. Reparent in rest pose to bend the continuous skin naturally.
        model.updateMatrixWorld(true); parent.attach(bone); parent=bone;
        const amount = finger === 'middle-finger' || suffix === 'tip' || suffix === 'metacarpal' ? 0 : finger === 'thumb' ? 1.05 : suffix === 'phalanx-proximal' ? 1.2 : 1.55;
        joints.push({bone,rest:bone.quaternion.clone(),amount});
      }
    }
    const forearm = wrist.clone(false);
    forearm.name = 'forearm-anchor';
    wrist.parent!.add(forearm);
    const wristSupport = wrist.clone(false);
    wristSupport.name = 'wrist-transition';
    wrist.parent!.add(wristSupport);
    // Upper silhouette in the fixed forearm pose, expressed in model coordinates.
    const upperForearm = new THREE.Vector3(0,1,0).applyQuaternion(
      new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),-1.12)
        .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),1.35)).invert());
    upperForearm.y=0;
    upperForearm.normalize().applyMatrix4(basis);
    model.traverse(object => { if (object instanceof THREE.Mesh) { object.material = material; const original = object.geometry;
      const vertices = original.getAttribute('position');
      const skinIndex = original.getAttribute('skinIndex');
      const skinWeight = original.getAttribute('skinWeight');
      let anchorIndex = -1;
      if (object instanceof THREE.SkinnedMesh) {
        const skeleton = object.skeleton;
        anchorIndex = skeleton.bones.length;
        const wristIndex = skeleton.bones.indexOf(wrist as THREE.Bone);
        object.skeleton = new THREE.Skeleton([...skeleton.bones, forearm as THREE.Bone, wristSupport as THREE.Bone], [...skeleton.boneInverses, skeleton.boneInverses[wristIndex].clone(), skeleton.boneInverses[wristIndex].clone()]);
        skeleton.dispose();
      }
      for (let i=0;i<vertices.count;i++) {
        const vertex = new THREE.Vector3().fromBufferAttribute(vertices,i);
        const behindWrist = vertex.clone().sub(origin).dot(up);
        // Continue the forearm beyond the viewport even when the final gesture moves inward.
        if(behindWrist<0) {
          // Widen the cross-section gradually away from the wrist, leaving the palm intact.
          const radial=vertex.clone().sub(origin).addScaledVector(up,-behindWrist);
          const widening=.65*THREE.MathUtils.smoothstep(-behindWrist,0,.018);
          vertex.addScaledVector(radial,widening);
          if(side==='left') {
            const wristBlend=THREE.MathUtils.smoothstep(-behindWrist,0,.008);
            const upperSide=THREE.MathUtils.smoothstep(radial.dot(upperForearm),-.008,.012);
            vertex.addScaledVector(upperForearm,.045*wristBlend*upperSide);
          }
          vertex.addScaledVector(up,behindWrist*18);
        }
        if(anchorIndex>=0 && behindWrist<.018) {
          const hold = THREE.MathUtils.smoothstep(-behindWrist,-.018,.018);
          const influences = [[anchorIndex,hold*hold], [anchorIndex+1,2*hold*(1-hold)]];
          for(let k=0;k<4;k++) influences.push([skinIndex.array[i*4+k],skinWeight.array[i*4+k]*(1-hold)*(1-hold)]);
          influences.sort((a,b)=>b[1]-a[1]);
          const total=influences.slice(0,4).reduce((sum,x)=>sum+x[1],0);
          for(let k=0;k<4;k++) {skinIndex.array[i*4+k]=influences[k][0];skinWeight.array[i*4+k]=influences[k][1]/total;}
        }
        vertices.setXYZ(i,vertex.x,vertex.y,vertex.z);
      }
      const smooth=smoothHand(original); original.dispose();
      const particles=createParticleHand(smooth);smooth.dispose();
      object.geometry=particles.geometry;object.material=particles.material;particleHands.push(particles);

      object.frustumCulled = false; } });
    if (!disposed) scene.add(root);
    return {root,joints,wrist,wristSupport,wristRest:wrist.quaternion.clone(),basis:new THREE.Quaternion().setFromRotationMatrix(basis)};
  }
  Promise.all([loadHand('left'),loadHand('right')]).then(([l,r])=> {
    if(disposed)return;
    left=l;right=r;host.classList.add('is-ready');render();if(!frame)frame=requestAnimationFrame(tick);
  }).catch(error=>console.warn('Hand model unavailable',error));
  const key=new THREE.SpotLight(0xf2f5ff,600,40,.225,.35,2.6);
  key.position.set(-4,-1,4);key.target.position.set(2,-1,0);key.castShadow=true;
  key.shadow.mapSize.set(1024,1024);key.shadow.bias=-.002;key.shadow.normalBias=.01;key.shadow.camera.near=1;key.shadow.camera.far=40;
  scene.add(key,key.target);
  const rim=new THREE.DirectionalLight(0xc3d5ff,.08);rim.position.set(-3,3,-3);scene.add(rim);
  const fill=new THREE.DirectionalLight(0xb9d8ff,.04);fill.position.set(-5,-2,3);scene.add(fill);
  let reach=0,turn=0,retreat=0,targetRetreat=0,targetReach=0,targetTurn=0,frame=0,lastTime=0,elapsed=0,visible=true;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const watch=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible&&!frame&&!disposed)frame=requestAnimationFrame(tick);});watch.observe(host);
  const motionChange=()=>{if(!frame&&!disposed)frame=requestAnimationFrame(tick);};
  reduced.addEventListener('change',motionChange);
  document.addEventListener('visibilitychange',motionChange);
  let contextLost=false;
  const loseContext=(event:Event)=>{event.preventDefault();contextLost=true;cancelAnimationFrame(frame);frame=0;host.classList.remove('is-ready');};
  const restoreContext=()=>{contextLost=false;lastTime=0;resize();if(left&&right)host.classList.add('is-ready');motionChange();};
  renderer.domElement.addEventListener('webglcontextlost',loseContext);
  renderer.domElement.addEventListener('webglcontextrestored',restoreContext);
  function tick(now:number) {
    if(disposed||contextLost){frame=0;return;}
    const dt=Math.min(32,lastTime ? now-lastTime : 16);lastTime=now;
    elapsed+=reduced.matches?0:dt/1000;
    const blend=1-Math.exp(-dt/65);
    reach+=(targetReach-reach)*blend;turn+=(targetTurn-turn)*blend;retreat+=(targetRetreat-retreat)*blend;render();
    if(visible&&!document.hidden&&(!reduced.matches||Math.abs(targetReach-reach)+Math.abs(targetTurn-turn)>.0005)) frame=requestAnimationFrame(tick);
    else {reach=targetReach;turn=targetTurn;retreat=targetRetreat;frame=0;lastTime=0;render();}
  }
  const padVertices=new WeakMap<THREE.SkinnedMesh,number[]>();
  function fingertipSurface(rig:Rig,direction:number){
    const samples:THREE.Vector3[]=[];
    let edge=-Infinity;
    rig.root.traverse(object=>{
      if(!(object instanceof THREE.SkinnedMesh))return;
      let indices=padVertices.get(object);
      if(!indices){
        indices=[];
        const skinIndex=object.geometry.getAttribute('skinIndex'),skinWeight=object.geometry.getAttribute('skinWeight');
        for(let i=0;i<skinIndex.count;i++){
          let influence=0;
          for(let j=0;j<4;j++){
            const bone=object.skeleton.bones[skinIndex.getComponent(i,j)];
            if(bone.name==='index-finger-phalanx-distal')influence+=skinWeight.getComponent(i,j);
          }
          if(influence>.5)indices.push(i);
        }
        padVertices.set(object,indices);
      }
      for(const i of indices){
        const point=object.getVertexPosition(i,new THREE.Vector3()).applyMatrix4(object.matrixWorld);
        const projected=point.clone().project(camera);
        edge=Math.max(edge,projected.x*direction);samples.push(point);
      }
    });
    if(!samples.length)return rig.root.getObjectByName('index-finger-tip')!.getWorldPosition(new THREE.Vector3());
    // Centre of the visible leading cap, sampled from the deformed skin, not the bone tip.
    const cap=samples.filter(point=>edge-point.clone().project(camera).x*direction<2/host.clientWidth);
    return cap.reduce((sum,p)=>sum.add(p),new THREE.Vector3()).divideScalar(cap.length);
  }
  function render() {
    if (disposed || contextLost || !left || !right) return;
    camera.position.y = -1.5 * (1-turn);
    camera.lookAt(0,camera.position.y,0);
    const narrow=host.clientWidth<600;
    const spread=narrow?3.4:3.6;
    left.root.position.set(-spread+reach*.3,-1.5,0);
    right.root.position.set(spread-reach*.3,-1.2,0);
    const axis = new THREE.Vector3(1,0,0);
    const yAxis = new THREE.Vector3(0,1,0), zAxis = new THREE.Vector3(0,0,1);
    const initial = new THREE.Quaternion().setFromAxisAngle(zAxis,-1.72)
      .multiply(new THREE.Quaternion().setFromAxisAngle(yAxis,1.35));
    const final = new THREE.Quaternion().setFromAxisAngle(zAxis,-.22)
      .multiply(new THREE.Quaternion().setFromAxisAngle(yAxis,-1.35));
    const forearmPose=new THREE.Quaternion().setFromAxisAngle(zAxis,-1.12)
      .multiply(new THREE.Quaternion().setFromAxisAngle(yAxis,1.35));
    left.root.quaternion.copy(forearmPose);
    const gestureScale = THREE.MathUtils.smoothstep(turn, .35, 1);
    left.root.scale.setScalar(THREE.MathUtils.lerp(1, .78, gestureScale));
    const desired = initial.clone().slerp(final,turn);
    // Quiet idle motion; settle at contact and during the deliberate scroll gesture.
    const leftIdle=reduced.matches?0:(1-retreat)*(1-.85*reach*(1-turn))*(1-.8*Math.sin(Math.PI*turn));
    desired.multiply(new THREE.Quaternion().setFromAxisAngle(zAxis,Math.sin(elapsed*.83)*.014*leftIdle))
      .multiply(new THREE.Quaternion().setFromAxisAngle(yAxis,Math.sin(elapsed*.61+.7)*.009*leftIdle));
    const wristDelta = forearmPose.clone().invert().multiply(desired);
    const nativeDelta = left.basis.clone().multiply(wristDelta).multiply(left.basis.clone().invert());
    left.wrist.quaternion.copy(nativeDelta).multiply(left.wristRest);
    left.wristSupport.quaternion.identity().slerp(nativeDelta,.5).multiply(left.wristRest);
    right.root.quaternion.setFromAxisAngle(zAxis,1.35)
      .multiply(new THREE.Quaternion().setFromAxisAngle(yAxis,-1.35));
    for (const hand of [left,right]) for (const joint of hand.joints) {
      const name=joint.bone.name;
      const isJoint=name.includes('phalanx');
      const finger=name.split('-')[0];
      const proximal=name.endsWith('phalanx-proximal');
      const bends:Record<string,[number,number]>={index:[.03,.11],middle:[.36,.65],ring:[.50,.80],pinky:[.62,.88],thumb:[.20,.30]};
      const relaxed=isJoint ? (bends[finger]||[0,0])[proximal?0:1] : 0;
      const fingerPhase=['thumb','index','middle','ring','pinky'].indexOf(finger);
      const breathing=hand===right&&finger!=='index'&&isJoint&&!reduced.matches
        ? Math.sin(elapsed*1.25+fingerPhase*1.15+(proximal?0:.3))*(proximal?.018:.035) : 0;
      const leftBreathing=hand===left&&isJoint
        ? Math.sin(elapsed*1.1+fingerPhase*.9+(proximal?0:.35))*(proximal?.018:.027)*leftIdle
          *(finger==='index'?.2:1)*(finger==='middle'?1-.85*turn:1-.45*turn) : 0;
      const curl=hand===left ? relaxed*(1-turn)+joint.amount*turn+leftBreathing : -relaxed*.85+breathing;
      joint.bone.quaternion.copy(joint.rest).multiply(new THREE.Quaternion().setFromAxisAngle(axis,-curl));
      if (name === 'thumb-metacarpal' && hand===left) joint.bone.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(zAxis,.65*turn));
    }
    // Frame the reaching pose by its fingertips: left hand above, right below.
    // Match the fingertip pads at equal depth, rather than overlapping their bones.
    camera.updateMatrixWorld(true);
    scene.updateMatrixWorld(true);
    const leftTip=fingertipSurface(left,1);
    const rightTip=fingertipSurface(right,-1);
    const depth=new THREE.Vector3(0,0,0).project(camera).z;
    // Approach along a fixed horizontal line at the initial fingertip height.
    const contactY=-.12;
    const midpoint=new THREE.Vector3(0,contactY,depth).unproject(camera);
    // The tip bones sit inside the fingertip pads; leave room for both surfaces.
    const gap=THREE.MathUtils.lerp(.24,16/host.clientWidth,reach);
    const leftTarget=new THREE.Vector3(-gap,contactY,depth).unproject(camera);
    const rightTarget=new THREE.Vector3(THREE.MathUtils.lerp(gap,.06,turn),THREE.MathUtils.lerp(contactY,-.12,turn),depth).unproject(camera);
    const framing=1-THREE.MathUtils.smoothstep(turn,0,.65);
    left.root.position.add(leftTarget.sub(leftTip).multiplyScalar(framing));
    left.root.position.x+=1.7*THREE.MathUtils.smoothstep(turn,.15,1);
    right.root.position.add(rightTarget.sub(rightTip));
    // Slide each rig out horizontally at constant depth and scale.
    left.root.position.add(new THREE.Vector3(-12*retreat,0,0));
    right.root.position.add(new THREE.Vector3(12*retreat,0,0));
    scene.updateMatrixWorld(true);
    const fingerGap=right.root.getObjectByName('middle-finger-phalanx-distal')!.getWorldPosition(new THREE.Vector3())
      .lerp(right.root.getObjectByName('index-finger-phalanx-distal')!.getWorldPosition(new THREE.Vector3()),.5);
    key.position.copy(fingerGap).add(new THREE.Vector3(-9,-3,-1));
    const lightSway=reduced.matches?0:Math.sin(elapsed*.32)*.32;
    key.target.position.copy(fingerGap).add(new THREE.Vector3(9,2.8+lightSway,-1));
    key.position.y+=reduced.matches?0:Math.sin(elapsed*.23)*.10;
    const screenContact=midpoint.project(camera);
    // The dial marker shares this exact contact point before its scroll-driven move.
    const story=host.closest<HTMLElement>('.hands-story');
    const sticky=host.closest<HTMLElement>('.hands-sticky');
    if(story&&sticky){
      const bounds=host.getBoundingClientRect();
      story.style.setProperty('--contact-y',`${bounds.top-sticky.getBoundingClientRect().top+(1-screenContact.y)*.5*bounds.height}px`);
    }
    particleHands.forEach(p=>{p.resize(host.clientWidth,host.clientHeight);p.update(elapsed,renderer.domElement);});
    lighting.render(scene,camera,new THREE.Vector2(screenContact.x*.5+.5,screenContact.y*.5+.5),0,key,left.root,right.root,elapsed);
  }
  function resize() {
    const width=host.clientWidth,height=host.clientHeight;
    if(!width||!height)return;
    renderer.setSize(width,height);
    lighting.resize(width,height);
    camera.aspect=width/height;
    // Fit the hands to viewport width so wide screens retain the reference scale.
    camera.position.z=8.6/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.aspect);
    camera.updateProjectionMatrix();render();
  }
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
  resize();
  return {
    update(nextReach:number,nextTurn:number,nextRetreat=0){targetReach=nextReach;targetTurn=nextTurn;targetRetreat=nextRetreat;if(!frame)frame=requestAnimationFrame(tick);},
    dispose(){if(disposed)return;disposed=true;renderer.domElement.removeEventListener('webglcontextlost',loseContext);renderer.domElement.removeEventListener('webglcontextrestored',restoreContext);watch.disconnect();reduced.removeEventListener('change',motionChange);document.removeEventListener('visibilitychange',motionChange);draco.dispose();cancelAnimationFrame(frame);resizeObserver.disconnect();scene.traverse(obj=>{if(obj instanceof THREE.Mesh)obj.geometry.dispose();});material.dispose();particleHands.forEach(p=>p.dispose());humanMaterials.forEach(m=>{for(const map of [m.map,m.normalMap,m.roughnessMap,m.metalnessMap,m.aoMap])map?.dispose();m.dispose();});lighting.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();}
  };
}
