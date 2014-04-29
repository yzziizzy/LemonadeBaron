


var Map = function(options) {
	
	var defaults = {
		size: pt(256,256),
		canvasSelector: null,
		canvas: null,
		context: null,
		showDebugLabels: false,
		prevCenter: {x: 0, y: 0},
	};
	
	var e = $.extend({}, defaults, options);
	for(x in e) this[x] = e[x];
	
	
	this.init();
}

Map.prototype.init = function() {
	
	// initialize the storage
	this.texCodes = new Uint8Array(this.size.x * this.size.y);
	
	
	this.canvas = $(this.canvasSelector)[0];
	this.context = this.canvas.getContext("2d");
	this.context.setTransform(1, 0, 0, 1, 0, 0);
	
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
	return images.debug_grass;
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



















