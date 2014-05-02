 
var PathSet = function(options) {
	
	var defaults = {
		nodes: [],
		edges: {}, // indexed by "from" node
		
		nodeMatchEpsilon: .5,
	};
	
	var e = $.extend({}, defaults, options);
	for(x in e) this[x] = e[x];
	
	// shorthand
	this.c = this.components;
	
	
	this.init();
};



PathSet.prototype.init = function() {
	
	
	
};

// returns the new node id
PathSet.prototype.addNode = function(pos) {
	
	var e = this.nodeMatchEpsilon;
	
	// look for an existing node that's close enough
	for(var i = 0; i < this.nodes.length; i++) {
		var n = this.nodes[i];
		if(pos.x + e >= n.x
			&& pos.x - e < n.x
			&& pos.y + e >= n.y
			&& pos.y - e < n.y) {
			
			return i;
		}
	}
	
	// no match has been found, insert a new one
	var ind = this.nodes.length;
	
	this.nodes.push(ptc(pos));
	this.edges[ind] = [];
	
	return ind;
};


// adds an edge between two nodes 
PathSet.prototype.addEdge = function(from, to, bidirectional) {
	
	if(-1 === this.edges[from].indexOf(to))
		this.edges[from].push(to); 
	
	if(bidirectional && -1 === this.edges[to].indexOf(from))
		this.edges[to].push(from); 
	
};

// adds a path between two points
PathSet.prototype.addPath = function(from, to, bidirectional) {
	var f = this.addNode(from);
	var t = this.addNode(to);
	
	return this.addEdge(f, t, bidirectional);
};


PathSet.prototype.directConnected = function(from, to) {
	return this.edges[from].indexOf(to) !== -1;
}


PathSet.prototype.getNodeNear = function(pos, e) {
	
	e = e || this.nodeMatchEpsilon;
	
	// look for an existing node that's close enough
	for(var i = 0; i < this.nodes.length; i++) {
		var n = this.nodes[i];
		if(pos.x + e >= n.x
			&& pos.x - e < n.x
			&& pos.y + e >= n.y
			&& pos.y - e < n.y) {
			
			return i;
		}
	}
	
	return null;
};

PathSet.prototype.followRandomEdge = function(node) {
	
	var edges = this.edges[node];
	
	if(!edges) return null; // bad node or no exits
	
	//var len = edges.length;
	
	// this logic may be completely bugged
	var i = rand(0, edges.length - 1);
	
	return ptc(this.nodes[edges[i]]);
};

