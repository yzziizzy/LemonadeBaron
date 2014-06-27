






// no optimizations, just gitrdone

var GridSP = function(options) {
	
	var defaults = {
		worldSize: pt(256,256),
		cellSize: 8,
		gridSize: pt(32,32),
		
		points: [],
		bounds: [],
		objs: Object.create(null),
	};
	
	var e = $.extend({}, defaults, options);
	for(x in e) this[x] = e[x];
	
	
	this.init();
}

GridSP.prototype.init = function() {
	
	var sz = this.gridSize.x * this.gridSize.y;
	
	for(var i = 0; i < sz; i++) {
		// create(null) is to obviate hasOwnProperty
		this.bounds[i] = Object.create(null);
		this.points[i] = Object.create(null);
	};
	
	
}


// removes and entity from the grid
GridSP.prototype.removeObj = function( eid) {
	
	var l = this.objs[eid];
	
	for(var j = 0; j < l.length; j++) {
		var i = l[j];
		delete this.points[i][eid];
		delete this.bounds[i][eid];
	}
	
	delete this.objs[eid];
}



// use this one to add an entity
GridSP.prototype.addObj = function(eid) {
	
	var aabb = game.getComp(eid, 'aabb');
	var pos = game.getComp(eid, 'position');
	
	this.insert(translateRect(aabb, pos), ptc(pos), eid);
}




// blindly adds, internal use only
GridSP.prototype.insert = function(rect, p, eid) {
	
	// FIXME: min/max tests for edges
	var minx = floor(min(rect.l, rect.r) / this.cellSize);
	var maxx = ceil(max(rect.l, rect.r) / this.cellSize);
	var miny = floor(min(rect.t, rect.b) / this.cellSize);
	var maxy = ceil(max(rect.t, rect.b) / this.cellSize);
	
	var l = [];
	
	for(var y = miny; y <= maxy; y++) {
		for(var x = minx; x <= maxx; x++) {
			var i = x + y * this.gridSize.x;
			
			this.points[i][eid] = p;
			this.bounds[i][eid] = rect;
			l.push(i);
		}
	}
	
	this.objs[eid] = l;
}



// center to center, for things that are small enough for the bounds to not matter
GridSP.prototype.rangeRadiusFast = function(qp, rad) {
	
	// FIXME: min/max tests for edges
	var minx = floor((qp.x - rad) / this.cellSize);
	var maxx = ceil((qp.x + rad) / this.cellSize);
	var miny = floor((qp.y - rad) / this.cellSize);
	var maxy = ceil((qp.y + rad) / this.cellSize);
	
	var l = [];
	
	for(var y = miny; y <= maxy; y++) {
		for(var x = minx; x <= maxx; x++) {
			var i = x + y * this.gridSize.x;
			
			for(eid in this.points[i]) {
				if(circleIntersect(qp, rad, this.points[i][eid], 0)) {
					l.push(eid);
				}
			}
			
		}
	}
	
	return l;
}


// this one runs as a system
GridSP.prototype.updatePositions = function() {
	
	var comps = ['position', 'nextpos'];
	
	runSystem(game.c, comps, function(ent) {
		
		// there should be some extra cleverness in this function. simplicity for now.
		
		// nothing in the grid actually moves atm
		
		
	});
	
}


















