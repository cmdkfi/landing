import * as THREE from 'three';

// One curved edge subdivision, retaining the four strongest skin influences.
// This rounds the low-poly WebXR silhouette without breaking bone deformation.
export function smoothHand(input: THREE.BufferGeometry) {
  const source = input.index ? input : input.toNonIndexed();
  const p = source.getAttribute('position'), n = source.getAttribute('normal');
  const si = source.getAttribute('skinIndex'), sw = source.getAttribute('skinWeight');
  const positions = Array.from(p.array), indices: number[] = [];
  const skinIndices = Array.from(si.array), skinWeights = Array.from(sw.array);
  const edges = new Map<string, number>();
  const point = (i:number) => new THREE.Vector3().fromBufferAttribute(p,i);
  function edge(a:number,b:number) {
    const key = a < b ? `${a}:${b}` : `${b}:${a}`;
    const cached=edges.get(key);if(cached!==undefined)return cached;
    const pa=point(a),pb=point(b),delta=pb.clone().sub(pa);
    const na=new THREE.Vector3().fromBufferAttribute(n,a),nb=new THREE.Vector3().fromBufferAttribute(n,b);
    const middle=pa.add(pb).multiplyScalar(.5).addScaledVector(na,-delta.dot(na)/8).addScaledVector(nb,delta.dot(nb)/8);
    const id=positions.length/3;positions.push(middle.x,middle.y,middle.z);
    const weights=new Map<number,number>();
    for(const vertex of [a,b])for(let k=0;k<4;k++) {
      const bone=si.array[vertex*4+k];weights.set(bone,(weights.get(bone)||0)+sw.array[vertex*4+k]/2);
    }
    const best=[...weights].sort((a,b)=>b[1]-a[1]).slice(0,4);const total=best.reduce((v,x)=>v+x[1],0);
    for(let k=0;k<4;k++){skinIndices.push(best[k]?.[0]||0);skinWeights.push((best[k]?.[1]||0)/total);}
    edges.set(key,id);return id;
  }
  const tris=source.index?.array || Array.from({length:p.count},(_,i)=>i);
  for(let i=0;i<tris.length;i+=3){const a=tris[i],b=tris[i+1],c=tris[i+2],ab=edge(a,b),bc=edge(b,c),ca=edge(c,a);indices.push(a,ab,ca,ab,b,bc,ca,bc,c,ab,bc,ca);}
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(skinIndices,4));
  geometry.setAttribute('skinWeight',new THREE.Float32BufferAttribute(skinWeights,4));
  geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}
