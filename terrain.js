


function Terrain(assets, atlas) {
	
	this.last = {
		center: [0,0],
		size: [0,0], // zero size will force an update on the first frame
	}
	
	this.prog = loadProgram2(assets.vertexShader.terrain, assets.fragmentShader.terrain);
	
	this.pos_ul = gl.getUniformLocation(this.prog, "position");
	
	this.vaoInfo = makeVAO([
		{ buf: 0, name: 'vpos',     loc: 0, count: 3, type: gl.FLOAT, norm: false },
		{ buf: 0, name: 'vtex',     loc: 1, count: 2, type: gl.FLOAT, norm: false },
		{ buf: 1, name: 'pos_ind',  loc: 2, count: 3, type: gl.FLOAT, norm: false, divisor: 1 },
	]);
	
	this.meshVBO = this.makeTerrainMeshVBO();
	this.instVBO = this.makeInstVBO();
	
	this.instances = [];
	
	this.tiles = { /* fill with tile atlas info */};

	
	this.blocks = {

		
		
	};
	
	
	this.dataTex = makeTexArray(gl.R8, 64,64, 16);
	
	// clear the map first
	var map = new Uint8Array(64*64).fill(0);
	for(var y = 0; y < 64; y++) {
		for(var x = 0; x < 64; x++) {
			var d = (Math.random() * 5) | 0;
			//console.log(d);
			map[x + (y * 64)] = d
		}
	}
	
	this.dataTex.updateLayer(0, map);
	
	this.tilesTex = assets.imageArray['terraintex'];
	
	
	return this;
}




Terrain.prototype.loadTiles = function(tiles) {
	for(var t in tiles) {
		
	}
	
	
}


Terrain.prototype.setTile = function(pos, tile) {
	
	
}




Terrain.prototype.makeBlock = function(tl) {
	var arr = new Uint16Array(64*64);
	arr.fill(0);
	
	return {
		aabb: [tl[0], tl[1], tl[0] + 64, tl[1] + 64],
		
		data: arr,
		meshVBO: this.makeTerrainVBO(arr),
		
		kids: {
			tl: null,
			tr: null,
			bl: null,
			br: null,
		},
	};
};




Terrain.prototype.makeTerrainMeshVBO = function(arr) {
	var buf = [];
	
	for(var y = 0; y < 64; y++) {
		for(var x = 0; x < 64; x++) {
			buf.push(x - 0.5);
			buf.push(y - 0.5);
			buf.push(1);
			buf.push(0);
			buf.push(0);
			
			
			buf.push(x - 0.5);
			buf.push(y + 0.5);
			buf.push(1);
			buf.push(0);
			buf.push(1);
			
			buf.push(x + 0.5);
			buf.push(y - 0.5);
			buf.push(1);
			buf.push(1);
			buf.push(0);
			
			// ------------------
			
			buf.push(x - 0.5);
			buf.push(y + 0.5);
			buf.push(1);
			buf.push(0);
			buf.push(1);
			
			buf.push(x + 0.5);
			buf.push(y - 0.5);
			buf.push(1);
			buf.push(1);
			buf.push(0);
			
			buf.push(x + 0.5);
			buf.push(y + 0.5);
			buf.push(1);
			buf.push(1);
			buf.push(1);
		}
	}
// 	console.log("vbo len", buf.length);

	return makeVBO(new Float32Array(buf), this.vaoInfo, 0, gl.DYNAMIC_DRAW);
}

Terrain.prototype.makeInstVBO = function(arr) {
	var buf = [];
	
	buf.push(0);
	buf.push(0);
	buf.push(0);
	
	buf.push(0);
	buf.push(0);
	buf.push(0);
	buf.push(0);
	buf.push(0);
	buf.push(0);
	buf.push(0);
	buf.push(0);
	buf.push(0);
	buf.push(0);
	buf.push(0);
	buf.push(0);
	
// 	console.log("vbo len", buf.length);
	return makeVBO(new Float32Array(buf), this.vaoInfo, 1, gl.DYNAMIC_DRAW);
}
/*
Terrain.prototype.makeTerrainVBO = function(arr) {
	var buf = [];
	var sz = 10;
	
	for(var y = 0; y < 64; y++) {
		for(var x = 0; x < 64; x++) {
			var n = arr[x + (y * 64)];
			var t = this.tiles[n];
			// position
			buf.push(x * sz);
			buf.push(y * sz);
			buf.push(1);
			
			// quad size
			buf.push(sz);
			buf.push(sz);
			
			// tex array index
			buf.push(t.texIndex);
			
			// tex offset, size
			buf.push(t.normOffset[0]);
			buf.push(t.normOffset[1]);
			buf.push(t.normSize[0]);
			buf.push(t.normSize[1]);
		}
	}
	
	return makeVBO(buf, this.vaoInfo, 1, gl.DYNAMIC_DRAW);
}*/


Terrain.prototype.render = function(game) {
	
	gl.useProgram(this.prog);
	
	var vp_ul = gl.getUniformLocation(this.prog, "mViewProj");
	gl.uniformMatrix4fv(vp_ul, false, game.vp);
	
	
	gl.activeTexture(gl.TEXTURE0 + 0);
	gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.tilesTex.tex);
// 	gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.dataTex.tex);
	var tex_ul = gl.getUniformLocation(this.prog, "sTex");
	gl.uniform1i(tex_ul, 0);

	gl.activeTexture(gl.TEXTURE0 + 1);
	gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.dataTex.tex);
	var lookup_tex_ul = gl.getUniformLocation(this.prog, "sTileLookup");
	gl.uniform1i(lookup_tex_ul, 1);
	
	gl.bindVertexArray(this.vaoInfo.vao);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.meshVBO.vbo);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.instVBO.vbo);
	
// 	console.log(this.meshVBO, this.instVBO);
	
	var primitiveType = gl.TRIANGLES;
	var offset = 0;
	var count = 6 * 64 * 64;
	var instances = 1;
	gl.drawArraysInstanced(primitiveType, offset, count, instances);
	
}
