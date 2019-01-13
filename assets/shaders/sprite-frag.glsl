#version 300 es

precision mediump float;
precision lowp sampler2DArray;

in vec2 tex_vs;
flat in float alpha_vs;
flat in float tex_index_vs;

out vec4 outColor;


uniform sampler2DArray sTex;


void main() {
	
	
 	vec4 d = texture(sTex, vec3(tex_vs, tex_index_vs));
	float a = d.a * alpha_vs;
	if(a < 0.005) discard;
	
	outColor = vec4(d.rgb, a);  
//  	outColor = vec4(tex_vs.xy,1.0, 1); 

}
