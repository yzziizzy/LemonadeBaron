#version 300 es

in vec4 v_pos_in;
in vec2 v_tex_in;

in vec4 i_pos_in;
in vec4 i_box_in; // offset, size
in vec4 i_tex_in; // offset, size
in vec4 i_color_in;

out vec2 tex_vs;

uniform mat4 mViewProj;



void main() {
	tex_vs = i_tex_in.xy + (v_tex_in * i_tex_in.zw);
	// HACK: the /8 is due to missing scaling in the generator
	vec4 pos = vec4((i_box_in.xy/8.0) + (v_pos_in.xy * i_box_in.zw), v_pos_in.zw);
	gl_Position = mViewProj * (pos + i_pos_in);
// 	gl_Position = mViewProj * (v_pos_in );
}
