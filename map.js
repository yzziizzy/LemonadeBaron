
var TILE_PASSABLE  = 0x0001,
	TILE_DRIVEABLE = 0x0002,
	TILE_WALKPATH  = 0x0004,
	TILE_BUILDABLE = 0x0008,
	TILE_HAS_BUILDING = 0x0010;
	





var Map = function(options) {
	
	var defaults = {
		size: pt(256,256),
		canvasSelector: null,
		canvas: null,
		context: null,
		showDebugLabels: false,
		prevCenter: {x: 0, y: 0},
		
		texCodes: null,
		layout: null,
		
		nameToCode: {},
		images: {},
		
	};
	
	var e = $.extend({}, defaults, options);
	for(x in e) this[x] = e[x];
	
	
	this.init();
}

Map.prototype.init = function() {
	
	// initialize the storage
	this.texCodes = new Uint8Array(this.size.x * this.size.y);
	this.layout = new Uint16Array(this.size.x * this.size.y);
	
	this.tileInfo = new Uint8Array(this.size.x * this.size.y);
	
	
	this.canvas = $(this.canvasSelector)[0];
	this.context = this.canvas.getContext("2d");
	this.context.setTransform(1, 0, 0, 1, 0, 0);
	
	
	// temporary hacks
	this.texImgMapping = {
		 0: 'grass',
		 1: 'road',
		 2: 'sidewalk_0000',
		 3: 'sidewalk_0001',
		 4: 'sidewalk_0010',
		 5: 'sidewalk_0011',
		 6: 'sidewalk_0100',
		 7: 'sidewalk_0101',
		 8: 'sidewalk_0110',
		 9: 'sidewalk_0111',
		10: 'sidewalk_1000',
		11: 'sidewalk_1001',
		12: 'sidewalk_1010',
		13: 'sidewalk_1011',
		14: 'sidewalk_1100',
		15: 'sidewalk_1101',
		16: 'sidewalk_1110',
		17: 'sidewalk_1111',
// 		18: '',
// 		19: '',
// 		20: '',
// 		21: '',
// 		22: '',
// 		23: '',
// 		24: '',
// 		25: '',
// 		26: '',
// 		27: '',
// 		28: '',
// 		29: '',
	};
	
	this.texImgMapping_inv = inverse(this.texImgMapping);
	
// 	this.images[0] = images.grass;
// 	this.images[1] = images.debug_road;
// 	this.images[2] = images.debug_sidewalk;
// 	this.nameToCode['grass'] = 0;
// 	this.nameToCode['road'] = 1;
// 	this.nameToCode['sidewalk'] = 2;
	
	
	this.texLayMapping = {
		grass: 'grass',
		road: 'road',
		sidewalk: {
			type: 'directional',
			prefix: 'sidewalk_',
		},
		
	};
	
	
	// eventually this will be a bit field
	this.layoutCodes = {
		grass: 0,
		road: 1,
		sidewalk: 2,
		walkingpath: 4,
	}
	
	this.layoutCodes_inv = inverse(this.layoutCodes);
	this.layoutCodes_inv[3] = 'road';
}

Map.prototype.getEdges = function(center) {
	
	var cwidth = this.canvas.width;
	var cheight = this.canvas.height;
	
	return rect(
		center.y + (cheight / 128),
		center.y - (cheight / 128),
		center.x - (cwidth / 128),
		center.x + (cwidth / 128)
	);
	
}

Map.prototype.getTileAt = function(x,y) {
	// temp hack
	if(x < 0 || y < 0 || x > this.size.x || y > this.size.y)
		return images.debug_grass;
	
//	return this.images[this.texCodes[x + (y * this.size.x)]];
	var tc = this.texCodes[x + (y * this.size.x)];
	var img = this.texImgMapping[tc]
	
	return images[img];
}


Map.prototype.mapToCanvas = function(center, mx, my) {
	var x = 0;
	var y = 0;
	
	x = center.x - mx; // offset from center
	x *= -64; // scale for tile size and invert (dunno why but it works)
	x -= 32; // scoot to the middle of the tile
	
	y = center.y - my; // offset from center
	y *= 64; // scale for tile size
	y -= 32; // scoot to the middle of the tile
	
	return {
		x: x,
		y: y
	};
	
	
}

// converts HTML document coordinates to map coordinates
Map.prototype.documentToMap = function(docX, docY) {
	var cwidth = this.canvas.width / 128;
	var cheight = this.canvas.height / 128;
	
	return pt(
		this.prevCenter.x - cwidth + docX/64,
		this.prevCenter.y + cheight - docY/64
	);
}

// remember y is inverted and the whole thing is scaled by 64
//center is in world coordinates
Map.prototype.render = function(center) {
	
	// don't render if nothing changed
	if(center.x == this.prevCenter.x && center.y == this.prevCenter.y) {
		// the fp compare is ok since we are actually checking for identical values
		return;
	}
	
	this.prevCenter = ptc(center);
	
	
	
	var cwidth = this.canvas.width;
	var cheight = this.canvas.height;
	
	var ctx = this.context;
	
	ctx.clearRect(0, 0, cwidth, cheight);

	ctx.save();
	
	
	// first move the origin to the middle of the screen
	// now all canvas coordinates will be relative to the center point
	ctx.translate(cwidth / 2, cheight / 2);
	
	// figure out the bounds of the map to render
	// these are in map coordinates
	var map_minx = Math.floor(center.x - (cwidth / 128));
	var map_maxx = Math.ceil(center.x + (cwidth / 128));
	var map_miny = Math.floor(center.y - (cheight / 128));
	var map_maxy = Math.ceil(center.y + (cheight / 128));
	
	
	for(var y = map_miny; y <= map_maxy; y++) { 
		for(var x = map_minx; x <= map_maxx; x++) { 
			
			// fetch which tile to render
			var tile = this.getTileAt(x,y);
			
			// get the top-left canvas rendering coordinate
			var cc =  this.mapToCanvas(center, x, y); 
			
			ctx.drawImage(tile, cc.x, cc.y);
			
			if(this.showDebugLabels) {
				ctx.font = ' 10px Sans Serif';
				ctx.fillText(x + "," + y, cc.x + 10, cc.y + 20);
			}
			
		}
	}
	
	ctx.restore();
	
}












Map.prototype.setTexAt = function(x, y, name) {
	
	if(x < 0 || y < 0 || x > this.size.x || y > this.size.y) return null;
	
	var old = this.nameToCode.indexOf(this.texCodes[x + (y * this.size.x)]);
	this.texCodes[x + (y * this.size.x)] = this.nameToCode[name];
	
	return old;
}


Map.prototype.fillRectTex = function(x1, y1, x2, y2, name) {
	
	var xmin = max(min(x1, x2), 0);
	var xmax = min(max(x1, x2), this.size.x);
	var ymin = max(min(y1, y2), 0);
	var ymax = min(max(y1, y2), this.size.y);
	
	var code = this.nameToCode[name];
	
	for(var y = ymin; y <= ymax; y++) {
		for(var x = xmin; x <= xmax; x++) {
			this.texCodes[x + (y * this.size.x)] = code;
		}
	}
	
	
}





Map.prototype.setLayAt = function(x, y, name) {
	
	if(x < 0 || y < 0 || x > this.size.x || y > this.size.y) return null;
	
	var old = this.layout[x + (y * this.size.x)];
	this.layout[x + (y * this.size.x)] = this.layoutCodes[name];
	
	return old;
}

Map.prototype.orLayAt = function(x, y, name) {
	
	if(x < 0 || y < 0 || x > this.size.x || y > this.size.y) return null;
	
	var old = this.layout[x + (y * this.size.x)];
	this.layout[x + (y * this.size.x)] = old | this.layoutCodes[name];
	
	return old;
}


Map.prototype.fillRectLay = function(x1, y1, x2, y2, name) {
	
	var xmin = max(min(x1, x2), 0);
	var xmax = min(max(x1, x2), this.size.x);
	var ymin = max(min(y1, y2), 0);
	var ymax = min(max(y1, y2), this.size.y);
	
	var code = this.layoutCodes[name];
	
	for(var y = ymin; y <= ymax; y++) {
		for(var x = xmin; x <= xmax; x++) {
			this.layout[x + (y * this.size.x)] = code;
		}
	}
	
	
}



// these set bits

Map.prototype.setInfoAt = function(x, y, mask, op) {
	
	if(x < 0 || y < 0 || x > this.size.x || y > this.size.y) return null;
	
	if(op == '|') // sets bits
		this.tileInfo[x + (y * this.size.x)] |= mask;
	else if(op == '&') // clears all other bits
		this.tileInfo[x + (y * this.size.x)] &= mask;
	else if(op == '!') // clears selected bits
		this.tileInfo[x + (y * this.size.x)] &= !mask;
	else if(op == '^') // why not?
		this.tileInfo[x + (y * this.size.x)] ^= mask;
	
	
	return true;
}


Map.prototype.fillRectInfo = function(x1, y1, x2, y2, mask, op) {
	
	var xmin = max(min(x1, x2), 0);
	var xmax = min(max(x1, x2), this.size.x);
	var ymin = max(min(y1, y2), 0);
	var ymax = min(max(y1, y2), this.size.y);
	
	for(var y = ymin; y <= ymax; y++) {
		for(var x = xmin; x <= xmax; x++) {
			if(op == '|') // sets bits
				this.tileInfo[x + (y * this.size.x)] |= mask;
			else if(op == '&') // clears all other bits
				this.tileInfo[x + (y * this.size.x)] &= mask;
			else if(op == '!') // clears selected bits
				this.tileInfo[x + (y * this.size.x)] &= !mask;
			else if(op == '^') // why not?
				this.tileInfo[x + (y * this.size.x)] ^= mask;
		}
	}
	
	
}



