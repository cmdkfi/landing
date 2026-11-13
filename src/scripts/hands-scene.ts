import * as THREE from 'three';
import { smoothHand } from './smooth-hand';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export function createHandsScene(host: HTMLElement) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .9;
  host.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
  camera.position.set(0, 0, 16);
  const room = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(room);
  scene.environment = environment.texture;
  room.dispose();
  pmrem.dispose();
  const material = new THREE.MeshPhysicalMaterial({ color: 0xb87c61, metalness: 0, roughness: .58, clearcoat: .05, envMapIntensity: .45 });
  type Rig = { root: THREE.Group; wrist: THREE.Object3D; wristRest: THREE.Quaternion; basis: THREE.Quaternion; joints: { bone: THREE.Object3D; rest: THREE.Quaternion; amount: number }[] };
  let left: Rig | undefined, right: Rig | undefined, disposed = false;
  const loader = new GLTFLoader();
  async function loadHand(side: 'left' | 'right'): Promise<Rig> {
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
    model.traverse(object => { if (object instanceof THREE.Mesh) { object.material = material; const original = object.geometry;
      const vertices = original.getAttribute('position');
      const skinIndex = original.getAttribute('skinIndex');
      const skinWeight = original.getAttribute('skinWeight');
      let anchorIndex = -1;
      if (object instanceof THREE.SkinnedMesh) {
        const skeleton = object.skeleton;
        anchorIndex = skeleton.bones.length;
        const wristIndex = skeleton.bones.indexOf(wrist as THREE.Bone);
        object.skeleton = new THREE.Skeleton([...skeleton.bones, forearm as THREE.Bone], [...skeleton.boneInverses, skeleton.boneInverses[wristIndex].clone()]);
        skeleton.dispose();
      }
      for (let i=0;i<vertices.count;i++) {
        const vertex = new THREE.Vector3().fromBufferAttribute(vertices,i);
        const behindWrist = vertex.clone().sub(origin).dot(up);
        if(behindWrist<0) vertex.addScaledVector(up,behindWrist*7);
        if(anchorIndex>=0 && behindWrist<.018) {
          const hold = THREE.MathUtils.smoothstep(-behindWrist,-.018,.012);
          const influences = [[anchorIndex,hold]];
          for(let k=0;k<4;k++) influences.push([skinIndex.array[i*4+k],skinWeight.array[i*4+k]*(1-hold)]);
          influences.sort((a,b)=>b[1]-a[1]);
          const total=influences.slice(0,4).reduce((sum,x)=>sum+x[1],0);
          for(let k=0;k<4;k++) {skinIndex.array[i*4+k]=influences[k][0];skinWeight.array[i*4+k]=influences[k][1]/total;}
        }
        vertices.setXYZ(i,vertex.x,vertex.y,vertex.z);
      }
      object.geometry = smoothHand(original); original.dispose(); object.frustumCulled = false; } });
    if (!disposed) scene.add(root);
    return {root,joints,wrist,wristRest:wrist.quaternion.clone(),basis:new THREE.Quaternion().setFromRotationMatrix(basis)};
  }
  Promise.all([loadHand('left'),loadHand('right')]).then(([l,r])=> {
    if(disposed)return;
    left=l;right=r;host.classList.add('is-ready');render();
  }).catch(error=>console.warn('Hand model unavailable',error));
  const key=new THREE.DirectionalLight(0xffede0,1.8);key.position.set(-3,5,7);scene.add(key);
  const rim=new THREE.DirectionalLight(0x8278ff,1.2);rim.position.set(4,1,-4);scene.add(rim);
  const fill=new THREE.DirectionalLight(0xb9d8ff,.7);fill.position.set(-5,-2,3);scene.add(fill);
  let reach=0,turn=0,targetReach=0,targetTurn=0,frame=0,lastTime=0;
  function tick(now:number) {
    const dt=Math.min(32,lastTime ? now-lastTime : 16);lastTime=now;
    const blend=1-Math.exp(-dt/65);
    reach+=(targetReach-reach)*blend;turn+=(targetTurn-turn)*blend;render();
    if(Math.abs(targetReach-reach)+Math.abs(targetTurn-turn)>.0005) frame=requestAnimationFrame(tick);
    else {reach=targetReach;turn=targetTurn;frame=0;lastTime=0;render();}
  }
  function render() {
    if (!left || !right) return;
    const narrow=host.clientWidth<600;
    const spread=narrow?3.5:4.0;
    left.root.position.set(-spread+reach*.3,-.8,0);
    right.root.position.set(spread-reach*.3,-1.2,0);
    const axis = new THREE.Vector3(1,0,0);
    const yAxis = new THREE.Vector3(0,1,0), zAxis = new THREE.Vector3(0,0,1);
    // Both poses use the same side of the hand. Reversing the side here
    // twisted a stationary forearm by 155 degrees and collapsed the wrist.
    const initial = new THREE.Quaternion().setFromAxisAngle(zAxis,-1.65)
      .multiply(new THREE.Quaternion().setFromAxisAngle(yAxis,-1.4));
    const final = new THREE.Quaternion().setFromAxisAngle(zAxis,-.85)
      .multiply(new THREE.Quaternion().setFromAxisAngle(yAxis,-1.35));
    left.root.quaternion.copy(initial);
    const desired = initial.clone().slerp(final,turn);
    const wristDelta = initial.clone().invert().multiply(desired);
    const nativeDelta = left.basis.clone().multiply(wristDelta).multiply(left.basis.clone().invert());
    left.wrist.quaternion.copy(nativeDelta).multiply(left.wristRest);
    right.root.quaternion.setFromAxisAngle(zAxis,1.35)
      .multiply(new THREE.Quaternion().setFromAxisAngle(yAxis,-1.35));
    for (const hand of [left,right]) for (const joint of hand.joints) {
      const name=joint.bone.name;
      const isJoint=name.includes('phalanx');
      const relaxed=isJoint ? name.startsWith('index') ? .12 : name.startsWith('thumb') ? .24 : .48 : 0;
      const curl=hand===left ? relaxed*(1-turn)+joint.amount*turn : relaxed;
      joint.bone.quaternion.copy(joint.rest).multiply(new THREE.Quaternion().setFromAxisAngle(axis,-curl));
      if (name === 'thumb-metacarpal' && hand===left) joint.bone.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(zAxis,.65*turn));
    }
    renderer.render(scene,camera);
  }
  function resize() {
    const width=host.clientWidth,height=host.clientHeight;
    if(!width||!height)return;
    renderer.setSize(width,height);
    camera.aspect=width/height;
    camera.position.z=camera.aspect<.8?26:16;
    camera.updateProjectionMatrix();render();
  }
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
  resize();
  return {
    update(nextReach:number,nextTurn:number){targetReach=nextReach;targetTurn=nextTurn;if(!frame)frame=requestAnimationFrame(tick);},
    dispose(){disposed=true;cancelAnimationFrame(frame);resizeObserver.disconnect();scene.traverse(obj=>{if(obj instanceof THREE.Mesh)obj.geometry.dispose();});material.dispose();environment.dispose();renderer.dispose();renderer.domElement.remove();}
  };
}
