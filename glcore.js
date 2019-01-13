

// only regular objects with no wierd stuff
function clone(o) {
	var c = Array.isArray(o) ? [] : {};
	
	for(var p in o) {
		c[p] = typeof o[p] === 'object' ? clone(o[p]) : o[p];
	}
	
	return c;
}

function ajaxGet(url, cb) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url)
	
	xhr.onreadystatechange = function () {
		if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
			cb(null, xhr.responseText);
		}
	};
	
	xhr.send();
}

function getJSON(url, cb) {
	ajaxGet(url, function(err, raw) {
		if(err) return cb(err);
			
		var js;
		try {
			js = JSON5.parse(raw);
		}
		catch(e) {
			return cb(e);
		}
		
		cb(null, js);
	});
}


function asyncParallel(list, cb) {
	var lookup = {};
	var num = list.length;
	var savedErr = null;
	for(var a in list) {
		var x = list[a];
		
		var fn = x[0];
		var args = x.slice(1);
		args.push((function(n) {
			return function(err) {
				if(err) savedErr = err;
				if(lookup[n]) return;
				lookup[n] = 1;
				num--;
				if(num == 0) cb(savedErr);
			}
		})(a));
		
		fn.apply(null, args);
	}
	
}


// don't feed this function bad values;
var getGLTypeSize;
(function() {

	
	getGLTypeSize = function(type) {
		
			var lookup = {};
	lookup[gl.BYTE] = 1;
	lookup[gl.UNSIGNED_BYTE] = 1;
	lookup[gl.SHORT] = 2;
	lookup[gl.UNSIGNED_SHORT] = 2;
	lookup[gl.INT] = 4;
	lookup[gl.UNSIGNED_INT] = 4;
	lookup[gl.HALF_FLOAT] = 2;
	lookup[gl.FLOAT] = 4;
		
		return lookup[type] || 999999999;
	}
})();



function Texture(target, w, h) {
	
	this.tex = gl.createTexture();
	this.target = target;
	this.w = w;
	this.h = h;
	this.depth = -1;
	
	// TODO: fix this
	this.format = gl.UNSIGNED_BYTE;
	
	return this;
}

Texture.prototype.bind = function() {
	gl.bindTexture(this.target, this.tex);
}
Texture.prototype.unbind = function() {
	gl.bindTexture(this.target, null);
}

Texture.prototype.updateLayer = function(layer, data) {
	if(this.depth < 2 || this.depth <= layer) {
		console.log("attempting to update invalid texture layer");
		return;
	}
	
	console.log(this.target, gl.TEXTURE_2D_ARRAY);
	this.bind();
	
	gl.texSubImage3D(this.target, 0,
		0, 0, layer, // offset
		this.w, this.h, 1, 
		/*this.type*/gl.RED, this.format,
		data
	);
	
}


function loadTexture(image) {
	var tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
// 	gl.generateMipmap(gl.TEXTURE_2D);
	gl.bindTexture(gl.TEXTURE_2D, null);
	
	return {
		tex: tex,
		w: image.width,
		h: image.height,
	};
}

function loadTextureArray(images) {
	var w = images[0].width;
	var h = images[0].height;
	
	
	var tex = makeTexArray(gl.RGBA8, w, h, images.length);
	tex.bind();
	
	//gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, gl.RGBA8, w, h, images.length);
	
	for(var i in  images) {
		gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0,
			0, 0, i, // offset
			w, h, 1, 
			gl.RGBA, gl.UNSIGNED_BYTE,
			images[i]
		);
	}
	
// 	gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
	tex.unbind();
	
	tex.depth = images.length;
	
	return tex;
}

function makeTexArray(type, w, h, d) {
	
	var tex = new Texture(gl.TEXTURE_2D_ARRAY, w, h);
	
	tex.bind();
	gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, type, w, h, d);
	tex.unbind();
	
	tex.depth = d;
	tex.type = type;
	
	return tex;
}


function loadShader(type, source) {
	var shader = gl.createShader(type);
	
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	
	var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	if (success) {
		return shader;
	}
	
	console.log(gl.getShaderInfoLog(shader));
	gl.deleteShader(shader);
}



function loadProgram2(vert, frag) {
	
	var program = gl.createProgram();
	
	gl.attachShader(program, loadShader(gl.VERTEX_SHADER, vert));
	gl.attachShader(program, loadShader(gl.FRAGMENT_SHADER, frag));
	
	gl.linkProgram(program);
	var success = gl.getProgramParameter(program, gl.LINK_STATUS);
	if(success) {
		return program;
	}
	
	console.log(gl.getProgramInfoLog(program));
	gl.deleteProgram(program);
	
}


function loadProgram(ids) {
	var lookup = {
		'glsl-vertex': gl.VERTEX_SHADER,
		'glsl-fragment': gl.FRAGMENT_SHADER,
	};
	
	var program = gl.createProgram();
	
	for(var i = 0; i < ids.length; i++) {
		var id = ids[i];
		
		var elem = document.getElementById(id);
		console.log(elem);
		gl.attachShader(program, loadShader(lookup[elem.getAttribute('type')], elem.text));
	}
	
	gl.linkProgram(program);
	var success = gl.getProgramParameter(program, gl.LINK_STATUS);
	if(success) {
		return program;
	}
	
	console.log(gl.getProgramInfoLog(program));
	gl.deleteProgram(program);
}







function calcVAOStride(attribs, bufIndex) {
	var stride = 0;
	for(var a of attribs) {
		if(bufIndex == a.buf) {
			stride += getGLTypeSize(a.type) * a.count;
		}
	}
	return stride;
}

/*
attrib: [
	{ name: 'pos',    loc: 0, count: 3, type: gl.FLOAT, norm: false },
	{ name: 'normal', loc: 0, count: 3, type: gl.FLOAT, norm: false },
]

*/
function makeVAO(attribs) {

	
	var vaoInfo = {
		attribs: clone(attribs),
// 		stride: stride,
		vao: gl.createVertexArray(),
	};
	
	return vaoInfo;
}

function configVAO(vaoInfo, bufIndex) {
	var off = 0;
	var stride = calcVAOStride(vaoInfo.attribs, bufIndex);
	
	for(var a of vaoInfo.attribs) {
		if(bufIndex == a.buf) {
			gl.enableVertexAttribArray(a.loc);
// 			console.log(a, off, stride);
			gl.vertexAttribPointer(a.loc, a.count, a.type, a.norm, stride, off);
			if(a.divisor) gl.vertexAttribDivisor(a.loc, a.divisor);
			off += getGLTypeSize(a.type) * a.count;
		}
	}
	
}


function makeVBO(data, vaoInfo, bufIndex, hint) {
	var buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);
	gl.bindVertexArray(vaoInfo.vao);
	
	if(hint == undefined) hint = gl.STATIC_DRAW;
	
	configVAO(vaoInfo, bufIndex);
	
	gl.bufferData(gl.ARRAY_BUFFER, data, hint);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	
	return {
		vbo: buf,
		vaoInfo: vaoInfo,
		type: gl.ARRAY_BUFFER,
	};
}


function makeIBO(data, hint) {
	var buf = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf);
	
	if(hint == undefined) hint = gl.STATIC_DRAW;
	
	configVAO(vaoInfo);
	
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, hint);
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, 0);
	
	return {
		ibo: buf,
		type: gl.ELEMENT_ARRAY_BUFFER,
	};
}



function makeBufferTMP() {
	var positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	
	var positions = [
		0, 0, 0,
		0, 1, 0,
		1, 0, 0,
		0, 1, 0,
		1, 0, 0,
		1, 1, 0,
	];
	
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
	
	var vao = gl.createVertexArray();
	gl.bindVertexArray(vao);
	
	var positionAttributeLocation = gl.getAttribLocation(program, "pos_in");
	gl.enableVertexAttribArray(positionAttributeLocation);
	
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
	
	return [vao, positionBuffer];
}

function makeSDFChar(char, font, info, buffer, adv, z) {
	var ix = info.charInfoIndices; 
	var ci = font[char];
	
	var box = {
		x: ci[ix.boxSize][0],
		y: ci[ix.boxSize][1],
	};
	
	var no = {
		x: ci[ix.normalizedOffset][0],
		y: ci[ix.normalizedOffset][1],
	};
	
	var ns = {
		x: ci[ix.normalizedSize][0],
		y: ci[ix.normalizedSize][1],
	};
	
	buffer.push(adv);
	buffer.push(0);
	buffer.push(z);
	
	buffer.push(ci[ix.boxOffset][0]);
	buffer.push(ci[ix.boxOffset][1]);
	
	buffer.push(ci[ix.boxSize][0]);
	buffer.push(ci[ix.boxSize][1]);
	
	buffer.push(ci[ix.normalizedOffset][0]);
	buffer.push(ci[ix.normalizedOffset][1]);

	buffer.push(ci[ix.normalizedSize][0]);
	buffer.push(ci[ix.normalizedSize][1]);
	
	buffer.push(1);
	buffer.push(.5);
	buffer.push(.2);
	buffer.push(1);
	
	return ci[ix.advance] - 1;
}

// TODO: optimize
function makeSDFCharOld(char, font, info, buffer, adv, z) {
	function vert(x,y,z,u,v) {
		buffer.push(x);
		buffer.push(y);
		buffer.push(z);
		buffer.push(u);
		buffer.push(v);
	}
	
	var ix = info.charInfoIndices; 
	var ci = font[char];
	
	var box = {
		x: ci[ix.boxSize][0],
		y: ci[ix.boxSize][1],
	};
	
	var no = {
		x: ci[ix.normalizedOffset][0],
		y: ci[ix.normalizedOffset][1],
	};
	
	var ns = {
		x: ci[ix.normalizedSize][0],
		y: ci[ix.normalizedSize][1],
	};
	
	vert(adv, 0, z, no.x, no.y + ns.y);
	vert(adv, box.y, z, no.x, no.y);
	vert(adv+box.x, 0, z, no.x + ns.x, no.y + ns.y);
	
	vert(adv, box.y, z, no.x, no.y);
	vert(adv+box.x, 0, z, no.x + ns.x, no.y + ns.y);
	vert(adv+box.x, box.y, z, no.x + ns.x, no.y);
	
	return ci[ix.advance];
}



function makeQuad(vaoInfo, bufIndex) {
	var quad = new Float32Array([
		0, 0, 0,  0, 1,
		0, 1, 0,  0, 0,
		1, 0, 0,  1, 1,
		1, 1, 0,  1, 0,
	]);
	
	return makeVBO(quad, vaoInfo, bufIndex);
}
