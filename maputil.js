


function Map() {
	
	this.blockSize = 64;
	
	this.blocks = {};
	
	this.paths = {
		roads: {}
	};
	
	return this;
}


Map.prototype.getBlockForPt = function(x, y) {
	return this.getBlock(Math.floor(x / this.blockSize), Math.floor(y / this.blockSize)); 
};

Map.prototype.getBlock = function(bx, by) {
	return this.blocks[parseInt(bx) + ":" + parseInt(by)];
};

Map.prototype.makeBlock = function(bx, by) {
	var t = {
		blockPos: {x: bx, y: by},
		tiles: new Uint8Array(this.blockSize * this.blockSize),
		type: new Uint8Array(this.blockSize * this.blockSize),
		
		tilesTexIndex: null,
		tilesDirty: true,
	};
	
	this.blocks[parseInt(bx) + ":" + parseInt(by)] = t;
	
	return t;
};

Map.prototype.forceBlockForPt = function(x, y) {
	var bx = Math.floor((x + .5) / 64);
	var by = Math.floor((y + .5) / 64);
	var t = this.getBlock(bx, by);
	
	if(t) return t;
	
	return this.makeBlock(bx, by);
}


Map.prototype.blocksInArea = function(a, b) {
	var out = [];
	
	var min = {
		x: Math.min(a.x, b.x),
		y: Math.min(a.y, b.y),
	};
	var max = {
		x: Math.max(a.x, b.x),
		y: Math.max(a.y, b.y),
	};
	
	for(var y = min.y; y <= max.y; y += this.blockSize) {
		for(var x = min.x; x <= max.x; x += this.blockSize) {
			var b = this.getBlockForPt(x, y);
			if(b) out.push(b);
		}
	}
	
	return out;
}










//////////////////////////////
// Map Editing Functions


// only axis-aligned
Map.prototype.placeRoad = function(from, to, stripe) {
	
	var min = {
		x: Math.min(from.x, to.x),
		y: Math.min(from.y, to.y),
	};
	var max = {
		x: Math.max(from.x, to.x),
		y: Math.max(from.y, to.y),
	};
	
	var delta;
	if(from.x == to.x) delta = {x: 1, y: 0};
	else delta = {x: 0, y: 1};
	
// 	console.log(min, max)
	
// 	var perpdelta = {x: delta.y, y: delta.x};
	
// 	var pos = min.x
	for(var y = min.y; y <= max.y; y++) {
		for(var x = min.x; x <= max.x; x++) {
// 			console.log(x,y);
			this.placeStripe(stripe, {x:x, y:y}, delta);
		}
	}
	
}

Map.prototype.fillRandom = function(a, b, tiles) {
	var min = Math.min(a.x, b.x);
	var max = Math.max(a.x, b.x);
	
	var len = tiles.length - 1;
	
	for(var y = min; y <= max; y++) {
		for(var x = min; x <= max; x++) {
			this.set_(x, y, tiles[Math.floor((Math.random() * len) + 0.5)]);
		}
	}
}
	
Map.prototype.fill = function(a, b, tile) {
	
	var min = Math.min(a.x, b.x);
	var max = Math.max(a.x, b.x);
	
	for(var y = min; y <= max; y++) {
		for(var x = min; x <= max; x++) {
			this.set_(x, y, tile);
		}
	}
}


function pt(x, y) {
	return {x:x, y:y};
}
function vadd(a, b) {
	return {x: a.x + b.x, y: a.y + b.y};
}

Map.prototype.set_ = function(x, y, tile) {
	var b = this.forceBlockForPt(x, y);
	var lx = Math.floor((x % this.blockSize) + .5);
	var ly = Math.floor((y % this.blockSize) + .5);
	b.tiles[lx + (ly * this.blockSize)] = tile;
}

Map.prototype.set = function(pos, tile) {
	this.set_(pos.x, pos.y, tile);
}

Map.prototype.placeStripe = function(stripe, start, delta) {
	
	var pos = {x: start.x, y: start.y};
	for(var i = 0; i < stripe.length; i++) {
		this.set(pos, stripe[i]);
		pos.x += delta.x;
		pos.y += delta.y;
	}
}







