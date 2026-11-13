import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export function createHandsScene(host: HTMLElement) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
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
  const material = new THREE.MeshPhysicalMaterial({ color: 0x66597d, metalness: .72, roughness: .23, clearcoat: 1, clearcoatRoughness: .08, transmission: .25, thickness: .7, ior: 1.45, envMapIntensity: 1.25 });
  const nails = new THREE.MeshPhysicalMaterial({ color: 0xc8b5ef, metalness: .65, roughness: .22, clearcoat: 1 });
  const sphere = new THREE.SphereGeometry(1, 24, 16);
  function oval(parent: THREE.Object3D, x:number,y:number,z:number,sx:number,sy:number,sz:number, mat=material) {
    const mesh = new THREE.Mesh(sphere,mat); mesh.position.set(x,y,z); mesh.scale.set(sx,sy,sz); parent.add(mesh); return mesh;
  }
  function makeHand(mirror:number) {
    const root = new THREE.Group(); scene.add(root);
    const anatomy = new THREE.Group(); anatomy.scale.x=mirror; root.add(anatomy);
    // Palm, heel and long forearm form one overlapping, rounded silhouette.
    oval(anatomy,0,-.05,0,.72,.95,.28);
    oval(anatomy,-.42,-.34,.04,.34,.58,.27);
    oval(anatomy,.08,-.84,-.02,.47,.54,.23);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(.43,.64,3.8,32),material);
    arm.position.set(.08,-2.95,-.04); anatomy.add(arm);
    oval(anatomy,.08,-1.15,0,.44,.4,.24);
    const fingers: THREE.Group[][]=[];
    const sizes=[.98,1.15,1.06,.83];
    for(let i=0;i<4;i++) {
      const chain:THREE.Group[]=[];
      let parent:THREE.Object3D=anatomy;
      const lengths=[sizes[i]*.48,sizes[i]*.32,sizes[i]*.27];
      for(let j=0;j<3;j++) {
        const joint=new THREE.Group();
        joint.position.set(j===0 ? -.48+i*.32 : 0,j===0 ? .61+(i===1?.12:i===3?-.12:.04) : lengths[j-1],0);
        parent.add(joint);
        const radius=(i===3?.135:.16)*(1-j*.12);
        oval(joint,0,lengths[j]/2,0,radius,lengths[j]/2+radius,radius*.88);
        if(j===2) oval(joint,0,lengths[j]*.68,.115,radius*.69,lengths[j]*.32,.025,nails);
        chain.push(joint);parent=joint;
      }
      fingers.push(chain);
    }
    const thumb=new THREE.Group();thumb.position.set(-.55,-.25,.04);thumb.rotation.z=.78;anatomy.add(thumb);
    oval(thumb,0,.22,0,.23,.43,.21);
    const thumbTip=new THREE.Group();thumbTip.position.y=.52;thumb.add(thumbTip);
    oval(thumbTip,0,.17,0,.18,.31,.17);
    oval(thumbTip,0,.29,.15,.12,.15,.025,nails);
    return {root,fingers,thumb,thumbTip};
  }
  const left=makeHand(1),right=makeHand(-1);
  const key=new THREE.DirectionalLight(0xddd1ff,2.5);key.position.set(-3,5,7);scene.add(key);
  const rim=new THREE.DirectionalLight(0x8278ff,7);rim.position.set(4,1,-4);scene.add(rim);
  const fill=new THREE.DirectionalLight(0xb9d8ff,2);fill.position.set(-5,-2,3);scene.add(fill);
  let reach=0,turn=0;
  function render() {
    const narrow=host.clientWidth<600;
    const spread=narrow?2.05:3.1;
    left.root.position.set(-spread+reach*1.3+turn*(narrow?.65:1.8),-.5+turn*.1,0);
    right.root.position.set(spread-reach*1.3+turn*2.8,-.5-turn*.8,-turn*2);
    left.root.rotation.set(.12+turn*.08, -.3+turn*Math.PI, -1.12*(1-turn));
    right.root.rotation.set(.12,.3,1.12+turn*.3);
    for(const hand of [left,right]) hand.fingers.forEach((chain,i)=>chain.forEach((joint,j)=>{
      const curl=hand===left && i!==1 ? turn : 0;
      joint.rotation.x=.10+j*.08+curl*(j===0?1.35:1.65);
      if(j===0) joint.rotation.z=(1.5-i)*.07*(1-turn);
    }));
    left.thumb.rotation.z=.78-turn*.9;left.thumb.rotation.x=turn*.8;left.thumbTip.rotation.x=turn*.8;
    renderer.render(scene,camera);
  }
  function resize() {
    const width=host.clientWidth,height=host.clientHeight;
    if(!width||!height)return;
    renderer.setSize(width,height);
    camera.aspect=width/height;
    camera.position.z=camera.aspect<.8?20:16;
    camera.updateProjectionMatrix();render();
  }
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
  host.classList.add('is-ready');resize();
  return {
    update(nextReach:number,nextTurn:number){reach=nextReach;turn=nextTurn;render();},
    dispose(){resizeObserver.disconnect();sphere.dispose();scene.traverse(obj=>{if(obj instanceof THREE.Mesh && obj.geometry!==sphere)obj.geometry.dispose();});material.dispose();nails.dispose();environment.dispose();renderer.dispose();renderer.domElement.remove();}
  };
}
