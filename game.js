

/*


game coordinate system:

     +y
      |
 -x --+-- +x
      |
     -y



*/



var Game = function(options) {
	
	var defaults = {
		maxEntities: 4*1024,
		curEntities: 0,
		nextIndex: 0,
		
		mapCenter: pt(128,128),
		
		runGame: true,
		gameState: 'loading',
		
		maxStep: .01,
		secondAcc: 0,
		
		input: {},
		inputCache: {
			pressed: {},
			down: {},
			clicked: {},
		},
		
		map: null,
		coll: null,
		entities: [],
		
		components: {
			
		},
		
		// quick lookup of entities of certain types
		classes: {
			players: [],
			npcs: [],
			activeRender: [],
			mapRender: [],
			stands: [],
		},
		
		systems: {
			
		},
		
		mapcounter: 0, 
		
		player: null, // points to an entity
	};
	
	var e = $.extend({}, defaults, options);
	for(x in e) this[x] = e[x];
	
	// shorthand
	this.c = this.components;
	
	
	this.init();
}


Game.prototype.init = function() {
	
	// a little splint here. there's probably a fancier js way to do this. meh.
	var that = this;
	this.animFrame = function() {
		that.loop();
	};
	
	
	var d = new Date();
	this.lastframe = d.getTime();

	
	// input handlers
	$(document).keydown(function(e) {
		that.inputCache.down[e.which] = 1;
		that.inputCache.down[e.which] |= 0;
		e.preventDefault();
	});
	$(document).keyup(function(e) {
		that.inputCache.down[e.which] = 0;
		that.inputCache.pressed[e.which] = (that.inputCache.pressed[e.which]>>>0) + 1;
		e.preventDefault();
	});
	
	// need to fix this
	$(document).mousedown(function(e) {
	/*	that.inputCache.down[e.which] = 1;
		that.inputCache.down[e.which] |= 0;
	*/	e.preventDefault();
	});
	$(document).mouseup(function(e) {
	/*	that.inputCache.down[e.which] = 0;
		that.inputCache.pressed[e.which] = (that.inputCache.pressed[e.which]>>>0) + 1;
	*/	e.preventDefault();
	});
	
	// need double clicks 
	// need dragging
	// need hover
	
	
	// canvas for actors
	this.actorCanvas = $('#entity-canvas')[0];
	this.actorCtx = this.actorCanvas.getContext("2d");
	this.actorCtx.setTransform(1, 0, 0, 1, 0, 0);
	
	// set up the map
	this.map = new Map({
		canvasSelector: '#tex-canvas',
		showDebugLabels: true,
	});
	
	// generate the map
	MapGen_1(this.map);
	
	
	this.systems = Systems;
	
	// add some content...
	
	this.spawn(Entities.susie);
	this.spawn(Entities.susieshouse);
	
	console.log('game init completed');
	// eh... 
	//this.loop();
};


Game.prototype.loop = function() {
	
	//console.log('looping');
	this.updateInput();
	
	// inludes timers
	this.updateGame();
	
	
	this.render();
	
	
	if(this.runGame) window.requestAnimFrame(this.animFrame);
};



Game.prototype.render = function() {
	
	// texture canvas
	this.map.render(this.mapCenter);
	
	
	// entity canvas
	this.actorCtx.clearRect(0, 0, this.actorCanvas.width, this.actorCanvas.height);


	
	this.systems.drawActors(
		this.actorCtx,
		{ width: this.actorCanvas.width, height: this.actorCanvas.height },
		this.mapCenter
	);
	
	
};



Game.prototype.updateInput = function() {
	
	var curinput = {
		down: this.inputCache.down,
		pressed: this.inputCache.pressed,
		clicked: this.inputCache.clicked,
	};
	
	this.inputCache.pressed = {};
	this.inputCache.clicked = {};
	
	this.input = curinput;
};


// broken....


Game.prototype.updateGame = function(te) {
	
	// timeless stuff
	
	this.systems.userControl();

	
	
	
	// update the time
	var d = new Date();
	var now = d.getTime();
	
	// time elapsed since last frame, in seconds
	var te = (now - this.lastframe) / 1000.0;
	this.lastframe = now; // put this at the end
	this.secondAcc += te;
	
	
	
	var steps = Math.floor(te / this.maxStep);
	var leftover = te - (steps * this.maxStep);
	
	// nice little physics steps
	for(var i = 0; i < steps; i++) {
		this.step(this.maxStep);
	}
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
	
	this.systems.move(te);
	this.systems.urge(te);
	
	
	
	this.systems.checkCollisions();
	
	this.systems.finalizeMove();
	
	
};

// this is for things that need per-frame updates, but can handle large steps like HUD
Game.prototype.frameStep = function(te) {
	
	this.systems.mapFollows(); 
	
};

// called ~ once every second. useful for game logic, etc
Game.prototype.secondStep = function(te) {
	
};





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


Game.prototype.spawn = function(entity) {
	var eid = this.addEntity();
	
	for(var prop in entity) { if(entity.hasOwnProperty(prop)) {
		this.addComponent(eid, prop, entity[prop]);
	}}
	
	return eid;
}




function runSystem(allComps, reqComps, cb){
	var len = reqComps.length;
	
	
	for(var eid in allComps[reqComps[0]]) {
		var go = true;
		var e = {};
		for(var i = 1; i < len; i++) {
			var cn = reqComps[i];
			if(!allComps[cn].hasOwnProperty(eid)) {
				go = false;
				break;
			}
			
			e[cn] = allComps[cn][eid]
		}
		
		if(go) cb(e);
	}
}




