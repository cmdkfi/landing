

uniform sampler2D tScene;
uniform sampler2D tLeft;
uniform sampler2D tHandMask;
uniform float uForegroundOnly;
uniform sampler2D tBloom;
uniform sampler2D tBeam;
uniform vec2 uBeamTexel;
uniform float uBloomStrength;
uniform float uGrainStrength;
uniform float uContrast;
uniform float uTime;
uniform vec2 uContact;
uniform float uContactStrength;
uniform float uContactAspect;

varying vec2 vUv;

float hash(uvec2 v) {
	v = v * 1664525u + 1013904223u;
	v.x += v.y * 1664525u;
	v.y += v.x * 1664525u;
	v ^= v >> 16u;
	v.x += v.y * 1664525u;
	v.y += v.x * 1664525u;
	v ^= v >> 16u;
	return float(v.x) * (1.0 / 4294967296.0);
}

void main() {

	vec3 beam = texture2D(tBeam, vUv).rgb * 0.4;
	beam += texture2D(tBeam, vUv + uBeamTexel * vec2( 0.9,  0.9)).rgb * 0.15;
	beam += texture2D(tBeam, vUv + uBeamTexel * vec2(-0.9,  0.9)).rgb * 0.15;
	beam += texture2D(tBeam, vUv + uBeamTexel * vec2( 0.9, -0.9)).rgb * 0.15;
	beam += texture2D(tBeam, vUv + uBeamTexel * vec2(-0.9, -0.9)).rgb * 0.15;

	vec3 color = texture2D(tScene, vUv).rgb
		+ texture2D(tBloom, vUv).rgb * uBloomStrength
		+ beam;

	gl_FragColor = vec4(color, 1.0);
	#include <tonemapping_fragment>
	#include <colorspace_fragment>

	gl_FragColor.rgb = clamp(
		(gl_FragColor.rgb - 0.5) * uContrast + 0.5,
		0.0,
		1.0
	);

	uvec2 seed = uvec2(gl_FragCoord.xy)
		+ uvec2(mod( 60.0, 1024.0)) * uvec2(7919u, 104729u);
	gl_FragColor.rgb -= vec3(hash(seed)) * uGrainStrength;

    // Composite the shaded hand over a light page without a dark volume backdrop.
    float edge=smoothstep(0.0,0.06,vUv.y)*(1.0-smoothstep(0.94,1.0,vUv.y));
    vec3 lit=max(gl_FragColor.rgb,vec3(0.0));
    float surfaceAlpha=texture2D(tScene,vUv).a;
    float hazeAlpha=clamp(max(lit.r,max(lit.g,lit.b))*.13,0.0,.13)*edge;
    float rightAlpha=surfaceAlpha+hazeAlpha*(1.0-surfaceAlpha);
    vec3 skin=mix(vec3(dot(lit,vec3(.2126,.7152,.0722))),lit,.3);
    vec3 rightColor=skin*surfaceAlpha+vec3(.88,.89,.92)*hazeAlpha*(1.0-surfaceAlpha);
    vec4 code=texture2D(tLeft,vUv);
    float alpha=code.a+rightAlpha*(1.0-code.a);
    vec3 combined=code.rgb*code.a+rightColor*(1.0-code.a);
    // Tenfold halo diameter; the contact core and shared pin stay small.
    vec2 delta=(vUv-uContact)*vec2(uContactAspect,1.0);
    float radius=length(delta);
    float core=exp(-radius*radius/0.000035);
    float haloRadius=radius/10.0;
    float halo=exp(-haloRadius*haloRadius/0.0011);
    float glow=clamp((core+halo*.65)*uContactStrength,0.0,1.0);
    vec3 flash=(vec3(1.0,.28,.28)*core*2.5+vec3(.65,.14,.18)*halo)*uContactStrength;
    alpha=glow+alpha*(1.0-glow);
    gl_FragColor=vec4((combined+flash)/max(alpha,0.001),alpha);
    float handCoverage=max(code.a,texture2D(tHandMask,vUv).a);
    gl_FragColor.a*=uForegroundOnly<0.0?1.0-handCoverage:mix(1.0,handCoverage,uForegroundOnly);
}
