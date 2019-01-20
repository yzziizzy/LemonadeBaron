


function main(assets) {
	console.log("assets:", assets);
	
	game = new Game(assets);

	game.init();
	
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
		game.gameTime += te;
		
// 		drawFrame(game, te, globalTimer);
		game.loop(te);
		
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


function Game(assets) {
	this.assets = assets;
	
	this.nextIndex = 1;
	
	this.entities = [];
	this.components = {
		position: {},
		nextpos: {},
		velocity: {},
		acceleration: {},
		rotation: {},
		scale: {},
		alpha: {},
		urge: {},
		maxSpeed: {},
		movable: {},
	};
	this.systems = Systems;
	
	this.maxStep = .01;
	this.secondAcc = 0;
	this.gameTime = 0;
	
}

Game.prototype.init = function() {
	var game = this;

	
		// init input stuff

	this.input = {
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
	
	

	
	this.cameraCenter = [-32,-32, -10];
// 	this.scale = -200.05;
	this.scale = 1;//-200.05;
	
	this.aspectRatio = gl.drawingBufferHeight / gl.drawingBufferWidth;
	
	
	var quad = new Float32Array([
		0, 0, 0,  0, 1,
		0, 1, 0,  0, 0,
		1, 0, 0,  1, 1,
		1, 1, 0,  1, 0,
	]);
	
	var buf = [];
	var font = this.assets.json.sdf_data.fonts["Courier"].regular;
	var adv = makeSDFChar("F".charCodeAt(0), font, this.assets.json.sdf_data, buf, 0, 0);
	adv += makeSDFChar("o".charCodeAt(0), font, this.assets.json.sdf_data, buf, adv, 0);
	adv += makeSDFChar("o".charCodeAt(0), font, this.assets.json.sdf_data, buf, adv, 0);
	adv += makeSDFChar("d".charCodeAt(0), font, this.assets.json.sdf_data, buf, adv, 0);
	
	//quad = new Float32Array(buf);
	
	this.vaoInfo = makeVAO([
		{ buf: 0, name: 'vpos', loc: 0, count: 3, type: gl.FLOAT, norm: false },
		{ buf: 0, name: 'vtex', loc: 1, count: 2, type: gl.FLOAT, norm: false },
		{ buf: 1, name: 'pos',   loc: 2, count: 3, type: gl.FLOAT, norm: false, divisor: 1 },
		{ buf: 1, name: 'box',   loc: 3, count: 4, type: gl.FLOAT, norm: false, divisor: 1 },
		{ buf: 1, name: 'tex',   loc: 4, count: 4, type: gl.FLOAT, norm: false, divisor: 1 },
		{ buf: 1, name: 'color', loc: 5, count: 4, type: gl.FLOAT, norm: false, divisor: 1 },
	]);
	
	this.vbo = makeVBO(quad, this.vaoInfo, 0);
	
	
	var inst = new Float32Array(buf);
	
	this.instvbo = makeVBO(inst, this.vaoInfo, 1);

	
	this.sdftex = loadTexture(this.assets.image.sdf_data);
	
	
	var ash = this.aspectRatio / 2;
	this.m_proj = mat4.create();
// 	mat4.ortho(this.m_proj, -0.5, 0.5, -ash, ash, 0, 1000);
	mat4.perspective(this.m_proj, 3.14 / 2.0, 
		gl.drawingBufferWidth / gl.drawingBufferHeight, 
		0.01, 1000);
	
//	console.log(glMatrix)
	
	this.terrain = new Terrain(this.assets);
	this.activeSprites = new SpriteSet(this.assets);
	
	for(var i = 0; i < 5; i++) {
		var e = this.addEntity();
		
		var pos = {
			x: 32 + (Math.random() * 2) - 1,
			y: 32 + (Math.random() * 2) - 1
		};
		this.addComponent(e, 'position', pos);
		this.addComponent(e, 'movable', 1);

		this.addComponent(e, 'scale', .5 + Math.random() * 2);
		this.addComponent(e, 'maxSpeed', 4.5 + Math.random() * 2);
		this.addComponent(e, 'nextpos', pt(pos.x, pos.y));
		this.addComponent(e, 'acceleration', {x:0,y:0});//pt(Math.random() * .1, Math.random() * .1));
		this.addComponent(e, 'velocity', pt(0,0));

		this.activeSprites.addInstance(e, 'marker-blue');
	}
	
	
	this.followEID = 3;
	
	console.log('init complete');   
	
}

Game.prototype.addEntity = function() {
	var i = this.nextIndex++;
	return i;
};
Game.prototype.getAllComponents = function(eid) {
	var l = [];
	
	for(var cn in this.components) { if(this.components.hasOwnProperty(cn)) {
		var cmp = this.components[cn][eid]
		
		if(cmp) {
			l.push({type: cn, data: cmp});
		}
	}}
	
	return l;
};

// checks existence first
Game.prototype.addComponent = function(eid, name, data) {
	
	if(!this.components[name])
		this.components[name] = {};
	
	this.components[name][eid] = data;
};


// doesn't check existence
Game.prototype.setComp = function(eid, name, data) {
	this.components[name][eid] = data;
};

Game.prototype.getComp = function(eid, name) {
	return this.components[name] ? this.components[name][eid] : null;
};
Game.prototype.removeComp = function(eid, name) {
	delete this.components[name][eid];
};


Game.prototype.spawn = function(entity) {
	var eid = this.addEntity();
	
	for(var prop in entity) { if(entity.hasOwnProperty(prop)) {
		var data = entity[prop];
		// fuck references. real languages use pointers.
		if(typeof data == 'object')
			data = clone(data);
		
		this.addComponent(eid, prop, data);
	}}
	
	return eid;
}


function runSystem(allComps, reqComps, cb){
	var len = reqComps.length;
	
	
	for(var eid in allComps[reqComps[0]]) {
		var go = true;
		var e = {};
		for(var i = 0; i < len; i++) {
			var cn = reqComps[i];
			if(!allComps[cn] || !allComps[cn].hasOwnProperty(eid)) {
				go = false;
				break;
			}
			
			e[cn] = allComps[cn][eid]
		}
		
		if(go) cb(e, eid);
	}
}



Game.prototype.loop = function(te) {
	
	//console.log('looping');
// 	this.updateInput();
	
	// inludes timers
	this.updateGame(te);
	
	
	this.render();
	
	
//	if(this.runGame) window.requestAnimFrame(this.animFrame);
};




Game.prototype.updateGame = function(te) {
	
	// timeless stuff
// 	this.systems.userControl();
	
	this.secondAcc += te;
	
	var steps = Math.floor(te / this.maxStep);
	var leftover = te - (steps * this.maxStep);
	
	// nice little physics steps
	for(var i = 0; i < steps; i++) {
		this.gameTime += this.maxStep;
		this.step(this.maxStep);
	}
	this.gameTime += leftover;
	this.step(leftover);
	
	// once per frame
	this.frameStep(te);
	
	// ~once per second
	if(this.secondAcc > 1) {
		this.secondStep(this.secondAcc);
		this.secondAcc = 0;
	};
	
	
	
	return te;
}


// this is for things that need reasonable integration like physics
Game.prototype.step = function(te) {
	
	
// 	this.systems.move(te);
	
	this.systems.goTo();
// 	console.log(te);
	
	this.systems.acceleration(te);
	this.systems.velocity(te);
	
// 	return;
	
	this.systems.urge(te);
	
	
	
// 	this.systems.checkCollisions();
	
	// the odometer must be called immediately before movement finalization
 	this.systems.odometer();
	this.systems.finalizeMove();
	
	
};

// this is for things that need per-frame updates, but can handle large steps like HUD
Game.prototype.frameStep = function(te) {
	return;
	this.systems.mapFollows(); 
	this.systems.lookAt();
	
};

// called ~ once every second. useful for game logic, etc
Game.prototype.secondStep = function(te) {
	return;
	this.systems.ai.thirst();
	this.systems.ai.thirsty_LocateStand();
	this.systems.ai.buyDrink();
	this.systems.ai.followPaths();
};



Game.prototype.render = function() {
// function drawFrame(game, timeElapsed, globalTime) {
	
	gl.clearColor(0, 0, 0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	
	this.vp = mat4.create();
	
	var scrollSpeed = 0.05;
	var u = {x:0, y:0, acc: 6};
	
	var ii = this.input;
	if(ii.down[37]) {
		//console.log(ii);
// 		this.cameraCenter[0] += scrollSpeed;
		u.x = -1;
	}
	if(ii.down[39]) {
		//console.log(ii);
// 		this.cameraCenter[0] += -scrollSpeed;
		u.x = 1;
	}
	if(ii.down[38]) {
		//console.log(ii);
// 		this.cameraCenter[1] += -scrollSpeed;
		u.y = 1;
	}
	if(ii.down[40]) {
		//console.log(ii);
// 		this.cameraCenter[1] += scrollSpeed;
		u.y = -1;
	}
	
	if(ii.down[90]) { // z
// 		this.scale += 0.0003;
		this.cameraCenter[2] += 1;
	}
	if(ii.down[88]) { // x
// 		this.scale -= 0.0003;
		this.cameraCenter[2] -= 1;
	}
	this.scale = Math.max(0.001, this.scale);
	this.scale = Math.min(1000.1, this.scale);
	
//  	var len = Math.hypot(u.x, u.y);
//  	u.x = u.x / len; 
// 	u.y = u.y / len; 
	this.components.urge[this.followEID] = u;
	
	
	var pos = this.components.position[this.followEID];
	
	var follow = vec4.fromValues(pos.x, pos.y, 0, 1);
	

	
	
	
	
	
	
	
	
	
	
	
	gl.useProgram(this.prog);
	
	
	this.m_view = mat4.create();
	//console.log(this.m_view);
//	mat4.scale(this.m_view, this.m_view, [this.scale, this.scale, this.scale]);
	mat4.translate(this.m_view, this.m_view, this.cameraCenter);
	
	
	
	
	mat4.mul(this.vp, this.m_proj, this.m_view);
	

	var ff = vec4.create();
	vec4.transformMat4(ff, follow, this.vp);
	
	// perspective divide
	ff[0] /= ff[3];
	ff[1] /= ff[3];
	ff[2] /= ff[3];
	
	if(ff[0] < -.8) {
		this.cameraCenter[0] += 0.5;
	}
	else if(ff[0] > .8) {
		this.cameraCenter[0] += -0.5;
	}
	
	if(ff[1] < -.8) {
		this.cameraCenter[1] += 0.5;
	}
	else if(ff[1] > .8) {
		this.cameraCenter[1] += -0.5;
	}
	
	
	this.terrain.render(this);
	this.activeSprites.render(this);

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


