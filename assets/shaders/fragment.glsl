#version 300 es

precision mediump float;


in vec2 tex_vs;

out vec4 outColor;


uniform sampler2D sTex;


void main() {
	
	float d = texture(sTex, tex_vs).r;
	float a;
	
	if(d > .75) {
		d = 1.0;// (d - .75) * -4;
	}
	else {
		d = (d / 3.0) * 4.0;
	}
	d = 1.0 - d;

	a = smoothstep(0.55, 0.65, abs(d));
	
	if(a < 0.01) {
		discard;
	};

	outColor = vec4(.4,.1,.1, a); 

}
