#version 300 es

precision mediump sampler2DArray;
precision mediump usampler2DArray;

in vec4 v_pos_in;
in vec2 v_tex_in;

in vec4 i_pos_in;
// in vec4 i_box_in; // offset, size
// in vec4 i_tex_in; // offset, size
// in vec4 i_color_in;

out vec2 tex_vs;
flat out float tex_index_vs;

uniform mat4 mViewProj;


uniform sampler2DArray sTileLookup;



void main() {
	tex_vs = v_tex_in;
	// HACK: the /8 is due to missing scaling in the generator
	vec4 pos = vec4(i_pos_in.xyz, 0) + v_pos_in;
	
	ivec3 tile_uv;// = ivec3((gl_VertexID / 6) % 64, (gl_VertexID / 6) / 64, 0); 
// 	tex_vs = vec2(float((gl_VertexID / 6) % 64) / 64.0, float((gl_VertexID / 6) / 64) / 64.0);
	float v = float(gl_VertexID) / 6.0;
	float f = v / (64.0);
	float f2 = mod(v, (64.0));
	tile_uv =  ivec3(f2,f, 0);
 	vec2 tex_vs2 = vec2(tile_uv.xy) / vec2(64.0, 64.0);
	
// 	tile_uv = ivec3(1,0,1);
	
	tex_index_vs = float(texelFetch(sTileLookup, tile_uv, 0).r) * 256.0;
	gl_Position = mViewProj * (pos);
// 	gl_Position = vec4(v_pos_in.xyz, 1);
// 	gl_Position = mViewProj * (v_pos_in );
}
