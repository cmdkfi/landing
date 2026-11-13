import * as THREE from 'three';

/** GPU-only glyph pass: samples the lit, skinned 3D scene without DOM text per frame. */
export function createAsciiHands(renderer: THREE.WebGLRenderer) {
  const atlas = document.createElement('canvas');
  const glyphs = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  atlas.width = 32 * glyphs.length; atlas.height = 40;
  const context = atlas.getContext('2d')!;
  const texture = new THREE.CanvasTexture(atlas);
  texture.minFilter = THREE.LinearFilter; texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  function drawAtlas() {
    context.clearRect(0,0,atlas.width,atlas.height);
    context.fillStyle = '#fff'; context.font = '650 29px "Inter Variable", sans-serif';
    context.textAlign = 'center'; context.textBaseline = 'middle';
    [...glyphs].forEach((glyph,i)=>context.fillText(glyph,i*32+16,21));
    texture.needsUpdate = true;
  }
  drawAtlas();
  const target = new THREE.WebGLRenderTarget(1,1,{depthBuffer:true});
  const uniforms = {
    source: {value:target.texture}, atlas: {value:texture},
    size: {value:new THREE.Vector2(1,1)}, cell: {value:new THREE.Vector2(8,12)},
    contact: {value:new THREE.Vector2(.5,.5)}, phase: {value:0},
  };
  const material = new THREE.ShaderMaterial({
    uniforms, transparent:true, depthTest:false, depthWrite:false,
    vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,
    fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D source, atlas;
      uniform vec2 size, cell, contact;
      uniform float phase;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 pixel=vUv*size;
        vec2 grid=floor(pixel/cell);
        vec2 center=(grid+.5)*cell;
        vec4 surface=texture2D(source,center/size);
        float light=dot(surface.rgb,vec3(.2126,.7152,.0722));
        float shade=smoothstep(.12,.72,light);
        float seed=hash(grid);
        float density=step(seed,.55+.45*shade);
        float body=surface.a*density;
        vec3 ink=mix(vec3(.41,.45,.51),vec3(.10,.12,.16),pow(shade,.65));
        float radius=mix(8.,min(size.x,size.y)*.31,phase);
        vec2 offset=center-contact*size;
        float distanceFromContact=length(offset);
        float envelope=sin(clamp(phase,0.,1.)*3.14159265);
        float shell=exp(-pow((distanceFromContact-radius)/max(12.,radius*.22),2.));
        float cloud=exp(-distanceFromContact*distanceFromContact/max(1.,radius*radius))*.4;
        float wave=(shell+cloud)*envelope*step(.27,hash(grid+floor(phase*16.)));
        float energy=exp(-distanceFromContact*distanceFromContact/1600.)*envelope;
        float mask=max(body,wave);
        float glyph=floor(hash(grid+floor(shade*6.))*36.);
        vec2 inCell=fract(pixel/cell);
        float letter=texture2D(atlas,vec2((glyph+inCell.x)/36.,inCell.y)).a;
        vec3 color=mix(ink,vec3(.85,.89,.98),clamp(wave+energy,0.,1.));
        float glow=exp(-distanceFromContact*distanceFromContact/max(1.,radius*radius*.5))*envelope*.12;
        gl_FragColor=vec4(color,clamp(letter*mask+glow,0.,1.));
      }`,
  });
  const scene=new THREE.Scene();
  const quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),material);scene.add(quad);
  const camera=new THREE.Camera();
  let disposed=false;
  document.fonts.ready.then(()=>{if(!disposed)drawAtlas();});
  return {
    resize(width:number,height:number){
      target.setSize(width,height);uniforms.size.value.set(width,height);
      uniforms.cell.value.set(width<600?7:9,width<600?11:14);
    },
    render(sourceScene:THREE.Scene,sourceCamera:THREE.Camera,point:THREE.Vector2,phase:number,destination:THREE.WebGLRenderTarget|null=null){
      uniforms.contact.value.copy(point);uniforms.phase.value=phase;
      renderer.setRenderTarget(target);renderer.render(sourceScene,sourceCamera);
      renderer.setRenderTarget(destination);renderer.render(scene,camera);
    },
    dispose(){disposed=true;quad.geometry.dispose();material.dispose();texture.dispose();target.dispose();},
  };
}
