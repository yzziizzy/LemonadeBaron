#version 300 es

precision mediump sampler2DArray;
precision mediump usampler2DArray;

in vec4 v_pos_in;
in vec2 v_tex_in;

in vec4 i_pos_in;
in vec4 i_r_s_a_in; // rotation, scale, alpha
// in vec4 i_tex_in; // offset, size
// in vec4 i_color_in;

out vec2 tex_vs;
flat out float alpha_vs;
flat out float tex_index_vs;

uniform mat4 mViewProj;



void main() {
	tex_vs = v_tex_in;
	// HACK: the /8 is due to missing scaling in the generator
//	vec4 pos = vec4(i_pos_in.xyz, 0) + v_pos_in;
	vec4 pos;
	float theta = i_r_s_a_in.x;
	float scale = i_r_s_a_in.y;
	
	float ct = cos(theta);
	float st = sin(theta);
	
	
	mat2 m = mat2(
		ct * scale, -st,
		st, ct * scale
	);
	
	pos = vec4(v_pos_in.xy * m, 0, 0) + i_pos_in;
	
	alpha_vs = i_r_s_a_in.z;
	tex_index_vs = i_r_s_a_in.w;
	gl_Position = mViewProj * (pos);
// 	gl_Position = vec4(v_pos_in.xyz, 1);
// 	gl_Position = mViewProj * (v_pos_in );
}
