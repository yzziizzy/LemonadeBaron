


function Terrain(assets, atlas) {
	this.atlas = atlas;
	
	this.last = {
		center: [0,0],
		size: [0,0], // zero size will force an update on the first frame
	}
	
	this.prog = loadProgram2(assets.vertexShader.terrain, assets.fragmentShader.terrain);
	
	this.pos_ul = gl.getUniformLocation(this.prog, "position");
	
	this.vaoInfo = makeVAO([
		{ buf: 0, name: 'vpos', loc: 0, count: 3, type: gl.FLOAT, norm: false },
		{ buf: 0, name: 'vtex', loc: 1, count: 2, type: gl.FLOAT, norm: false },
		{ buf: 1, name: 'pos_ind',  loc: 2, count: 3, type: gl.FLOAT, norm: false, divisor: 6 },
	]);
	
	this.qvbo = makeQuad(this.vaoInfo, 0);
	
	this.instances = [];
	
	this.tiles = { /* fill with tile atlas info */};

	
	this.blocks = {

		
		
	};
	
	
	return this;
}


Terrain.prototype.setTile = function(pos, tile) {
	
	
}

Terrain.prototype.render = function(ri, center, size) {
	gl.useProgram(this.prog);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, this.qvbo.vbo);
	
	//find and render blocks
}

Terrain.prototype.renderBlock = function(block) {
	
	gl.uniform2f(this.pos_ul, block.aabb[0], block.aabb[1]);

	gl.bindBuffer(gl.ARRAY_BUFFER, block.vbo.vbo);
	
	var offset = 0;
	var count = 4;
	var instances = 64 * 64;
	
	gl.drawArraysInstanced(gl.TRIANGLE_STRIP, offset, count, instances);
};




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
	var buf = []
	
	for(var y = 0; y < 64; y++) {
		for(var x = 0; x < 64; x++) {
			buf.push(x);
			buf.push(y);
			buf.push(1);
			buf.push(0);
			buf.push(0);
			
			
			buf.push(x);
			buf.push(y + 1);
			buf.push(1);
			buf.push(0);
			buf.push(1);
			
			buf.push(x + 1);
			buf.push(y);
			buf.push(1);
			buf.push(1);
			buf.push(0);
			
			buf.push(x);
			buf.push(y);
			buf.push(1);
			buf.push(0);
			buf.push(0);
			
			buf.push(x + 1);
			buf.push(y);
			buf.push(1);
			buf.push(1);
			buf.push(0);
			
			buf.push(x + 1);
			buf.push(y + 1);
			buf.push(1);
			buf.push(1);
			buf.push(1);
		}
	}
	
	return makeVBO(buf, this.vaoInfo, 1, gl.DYNAMIC_DRAW);
}

Terrain.prototype.makeInstVBO = function(arr) {
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
}
