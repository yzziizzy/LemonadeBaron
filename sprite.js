

function SpriteSet(assets) {
	
	this.prog = loadProgram2(assets.vertexShader.sprite, assets.fragmentShader.sprite);
	
	
	this.vaoInfo = makeVAO([
		{ buf: 0, name: 'vpos',   loc: 0, count: 3, type: gl.FLOAT, norm: false },
		{ buf: 0, name: 'vtex',   loc: 1, count: 2, type: gl.FLOAT, norm: false },
		{ buf: 1, name: 'pos',    loc: 2, count: 3, type: gl.FLOAT, norm: false, divisor: 1 },
		{ buf: 1, name: 'r_s_a_ind',  loc: 3, count: 4, type: gl.FLOAT, norm: false, divisor: 1 },
	]);
	
	this.instances = {};
	this.numInstances = 0;
	
	this.meshVBO = this.makeSpriteMeshVBO();
	this.instVBO = this.makeInstVBO();
	
	
	
	this.tilesTex = assets.imageArray['sprites'];
	
	
	
}



SpriteSet.prototype.addInstance = function(eid, image) {
	this.instances[eid] = {
		image: image,
		index: 1 + Math.floor(Math.random() * 4),
		eid: eid,
	};
	this.numInstances++;
}


SpriteSet.prototype.makeSpriteMeshVBO = function() {
	var quad = new Float32Array([
		-0.5, -0.5, -0.5,  0, 1,
		-0.5,  0.5, -0.5,  0, 0,
		 0.5, -0.5, -0.5,  1, 1,
		 0.5,  0.5, -0.5,  1, 0,
	]);
	
	return makeVBO(quad, this.vaoInfo, 0);
}



SpriteSet.prototype.makeInstVBO = function(arr) {
	var buf = [];
	
	for(var eid in this.instances) {
		var inst = this.instances[eid];
		buf.push(game.components.position[eid].x); // x
		buf.push(game.components.position[eid].y); // y
		buf.push(1);
		
		buf.push(game.components.rotation[eid] || 0); // rot
		buf.push(game.components.scale[eid] || 1); // scale
		buf.push(game.components.alpha[eid] || 1); // alpha
		buf.push(inst.index); // tex index
	}
	
// 	console.log("vbo len", buf.length);
	return makeVBO(new Float32Array(buf), this.vaoInfo, 1, gl.DYNAMIC_DRAW);
}



SpriteSet.prototype.render = function(game) {
	
	this.instVBO = this.makeInstVBO();
	
	gl.useProgram(this.prog);
	
	var vp_ul = gl.getUniformLocation(this.prog, "mViewProj");
	gl.uniformMatrix4fv(vp_ul, false, game.vp);
	
	
	gl.activeTexture(gl.TEXTURE0 + 0);
	gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.tilesTex.tex);
// 	gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.dataTex.tex);
	var tex_ul = gl.getUniformLocation(this.prog, "sTex");
	gl.uniform1i(tex_ul, 0);
	
	gl.bindVertexArray(this.vaoInfo.vao);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.meshVBO.vbo);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.instVBO.vbo);
	
// 	console.log(this.meshVBO, this.instVBO);
	
	var primitiveType = gl.TRIANGLE_STRIP;
	var offset = 0;
	var count = 4;
	var instances = this.numInstances;
// 	console.log(instances)
	gl.drawArraysInstanced(primitiveType, offset, count, instances);
	
	
	gl.deleteBuffer(this.instVBO.vbo);
}












