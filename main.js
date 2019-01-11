


function main(assets) {
	console.log("assets:", assets);
	
	var game = {};
	
	init(game, assets);
	
	game.prog = loadProgram2(assets.vertexShader.vert, assets.fragmentShader.frag);
	
// 	var [vao, vbo] = makeBuffer();
	
	
	
// 	var resolutionUniformLocation = gl.getUniformLocation(prog, "u_resolution");
	
		// Pass in the canvas resolution so we can convert from
// pixels to clipspace in the shader
// gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
	

// 	gl.ELEMENT_ARRAY_BUFFER
	


	
	

	
	var last = -1;
	var globalTimer = 0;
	
	requestAnimationFrame(draw);

	function draw(time) {
		
		var now = time * 0.001;
		
		if(last == -1) {
			last = now;
			requestAnimationFrame(draw);
			return;
		}
		
		var te = now - last;
		last = now;
		globalTimer += te;
		
		drawFrame(game, te, globalTimer);
		
		
		requestAnimationFrame(draw);
	}
	
// 	gl.bindBuffer(gl.ARRAY_BUFFER, buffer with offsets);
// gl.vertexAttribPointer(offset attrib location in shader, 3, gl.FLOAT, false, 12, 0);
// gl.vertexAttribDivisor(offset attrib location in shader, 1);
// 
// gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, number of vertices to render, number of instances to render);
	
}


function loadAssets(manifest, cb) {
	
	var assets = {
		'fragmentShader': {},
		'vertexShader': {},
		'json': {},
		'image': {},
		'imageArray': {},
	};
	
	function textgrab(m, cb) {
		ajaxGet(m.src, function(err, txt) {
			if(err) return cb(err);
			if(assets[m.type][m.name]) {
				console.log("duplicate asset for:", m);
			}
			assets[m.type][m.name] = txt;
			cb(null);
		});
	}
	
	function jsongrab(m, cb) {
		getJSON(m.src, function(err, txt) {
			if(err) return cb(err);
			if(assets[m.type][m.name]) {
				console.log("duplicate asset for:", m);
			}
			assets[m.type][m.name] = txt;
			cb(null);
		});
	}
	
	function imagegrab(m, cb) {
		var img = new Image();
		img.addEventListener('load', function() {
			if(assets[m.type][m.name]) {
				console.log("duplicate asset for:", m);
			}
			assets[m.type][m.name] = img;
			cb(null);
		});
		img.src = m.src;
	}
	
	function imageArraygrab(m, cb) {
		var imgList = [];
		
		function getimg(url, cb) {
			var img = new Image();
			imgList.push(img);
			img.addEventListener('load', function() { cb(img); });
			console.log(url);
			img.src = url;
		}
		
		
		var list = m.src.map(function(u) { return [getimg, u]; });
		asyncParallel(list, function(err) {
			if(assets[m.type][m.name]) {
				console.log("duplicate asset for:", m);
			}
			
			// TODO: load the array here
			assets[m.type][m.name] = loadTextureArray(imgList);
			cb(null);
		})
	}
	
	var loaders = {
		'fragmentShader': textgrab,
		'vertexShader': textgrab, 
		'json': jsongrab, 
		'image': imagegrab, 
		'imageArray': imageArraygrab, 
	};
	
	
	var todo = [];
	for(var a in manifest) {
		var m = manifest[a];
		
		var fn = loaders[m.type];
		if(typeof fn == 'function') {
			todo.push([fn, m]);
		}
	}
	
	asyncParallel(todo, function(err) {
		cb(err, assets);
	});
}



function init(game, assets) {
	
	

	
		// init input stuff

	game.input = {
		down: [],
		pressed: [],
	};
	
	document.addEventListener('keydown', function(e) {
		game.input.down[e.which] = 1;
		game.input.down[e.which] |= 0;
		e.preventDefault();
	});
	document.addEventListener('keyup', function(e) {
		game.input.down[e.which] = 0;
		game.input.pressed[e.which] = (game.input.pressed[e.which]>>>0) + 1;
		e.preventDefault();
	});
	
	

	
	game.cameraCenter = [-32,-32, -1];
	game.scale = .05;
	
	game.aspectRatio = gl.drawingBufferHeight / gl.drawingBufferWidth;
	
	
	var quad = new Float32Array([
		0, 0, 0,  0, 1,
		0, 1, 0,  0, 0,
		1, 0, 0,  1, 1,
		1, 1, 0,  1, 0,
	]);
	
	var buf = [];
	var font = assets.json.sdf_data.fonts["Courier"].regular;
	var adv = makeSDFChar("F".charCodeAt(0), font, assets.json.sdf_data, buf, 0, 0);
	adv += makeSDFChar("o".charCodeAt(0), font, assets.json.sdf_data, buf, adv, 0);
	adv += makeSDFChar("o".charCodeAt(0), font, assets.json.sdf_data, buf, adv, 0);
	adv += makeSDFChar("d".charCodeAt(0), font, assets.json.sdf_data, buf, adv, 0);
	
	//quad = new Float32Array(buf);
	
	game.vaoInfo = makeVAO([
		{ buf: 0, name: 'vpos', loc: 0, count: 3, type: gl.FLOAT, norm: false },
		{ buf: 0, name: 'vtex', loc: 1, count: 2, type: gl.FLOAT, norm: false },
		{ buf: 1, name: 'pos',   loc: 2, count: 3, type: gl.FLOAT, norm: false, divisor: 1 },
		{ buf: 1, name: 'box',   loc: 3, count: 4, type: gl.FLOAT, norm: false, divisor: 1 },
		{ buf: 1, name: 'tex',   loc: 4, count: 4, type: gl.FLOAT, norm: false, divisor: 1 },
		{ buf: 1, name: 'color', loc: 5, count: 4, type: gl.FLOAT, norm: false, divisor: 1 },
	]);
	
	game.vbo = makeVBO(quad, game.vaoInfo, 0);
	
	
	var inst = new Float32Array(buf);
	
	game.instvbo = makeVBO(inst, game.vaoInfo, 1);

	
	game.sdftex = loadTexture(assets.image.sdf_data);
	
	
	var ash = game.aspectRatio / 2;
	game.m_proj = mat4.create();
	mat4.ortho(game.m_proj, -0.5, 0.5, -ash, ash, 0, 1000);
	
//	console.log(glMatrix)
	
	game.terrain = new Terrain(assets);
	
	console.log('init complete');   
	
}



function drawFrame(game, timeElapsed, globalTime) {
	
	gl.clearColor(0, 0, 0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	var scrollSpeed = 0.05;
	
	var ii = game.input;
	if(ii.down[37]) {
		//console.log(ii);
		game.cameraCenter[0] += scrollSpeed;
	}
	if(ii.down[39]) {
		//console.log(ii);
		game.cameraCenter[0] += -scrollSpeed;
	}
	if(ii.down[38]) {
		//console.log(ii);
		game.cameraCenter[1] += -scrollSpeed;
	}
	if(ii.down[40]) {
		//console.log(ii);
		game.cameraCenter[1] += scrollSpeed;
	}
	
	
	
	
	gl.useProgram(game.prog);
	
	
	game.m_view = mat4.create();
	
	mat4.scale(game.m_view, game.m_view, [game.scale, game.scale, game.scale]);
	mat4.translate(game.m_view, game.m_view, game.cameraCenter);
	
	game.vp = mat4.create();
	
	
 	mat4.mul(game.vp, game.m_proj, game.m_view);
	
	game.terrain.render(game);

//	console.log(game.vp);
	
/*	
	gl.bindBuffer(gl.ARRAY_BUFFER, game.vbo.vbo);
	gl.bindBuffer(gl.ARRAY_BUFFER, game.instvbo.vbo);
	
	gl.activeTexture(gl.TEXTURE0 + 0);
	gl.bindTexture(gl.TEXTURE_2D, game.sdftex.tex);
	
	var vp_ul = gl.getUniformLocation(game.prog, "mViewProj");
	var tex_ul = gl.getUniformLocation(game.prog, "sTex");
	
	gl.uniformMatrix4fv(vp_ul, false, game.vp);
	gl.uniform1i(tex_ul, 0);
	
	var primitiveType = gl.TRIANGLE_STRIP;
	var offset = 0;
	var count = 4;
	var instances = 4;
	gl.drawArraysInstanced(primitiveType, offset, count, instances);
	
	*/
}


