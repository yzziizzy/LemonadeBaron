 

 
 
function pt(x,y) {
	return {x: x, y: y};
}
function ptc(p) {
	return {x: p.x, y: p.y};
}
function rect(top, bottom, left, right) {
	return {t: top, b: bottom, l: left, r: right};
}
function rectc(r) {
	return {t: r.t, b: r.b, l: r.l, r: r.r};
}


function intersectRect(a,b) { 
	var q = a.l > b.r ,
		w = a.r < b.l ,
		e = a.t < b.b ,
		r = a.b > b.t; 
	return !(q || w || e || r);
}



function norm(x,y) {
	var l = 1 / Math.sqrt(x*x + y*y);
	return {
		x:x * l,
		y:y * l
	}
}
function ptNorm(pt) {
	var l = 1 / Math.sqrt(pt.x*pt.x + pt.y*pt.y);
	return {
		x:pt.x * l,
		y:pt.y * l
	}
}


function exec(fn) { return fn() };



var fsm = function(initial) {
	
	this.table = {};
	this.state = initial;
	this.enter = {};
	this.leave = {};
}


fsm.prototype.addState = function(s) {
	this.table[s] = {};
	this.enter[s] = [];
	this.leave[s] = [];
}

fsm.prototype.addEdge = function(from, to, on) {
	this.table[from][on] = to;
}

fsm.prototype.send = function(action) {
	var t = this.table[this.state];
	if(!t) return false;
	
	var to = t[action];
	if(!t) return false;
	
	this.enter[to].map(exec);
	this.leave[this.state].map(exec);
	
	this.state = to;
	return true;
}

fsm.prototype.enter = function(state, fn) {
	this.enter[state].push(fn);
}

fsm.prototype.leave = function(state, fn) {
	this.leave[state].push(fn);
}















var hfsm = function(initial) {
	
	this.table = {};
	this.membership = {};
	this.state = initial;
	this.enter = {};
	this.leave = {};
}


hfsm.prototype.addState = function(s, ss) {
	this.table[s] = {};
	this.enter[s] = [];
	this.leave[s] = [];
	this.membership[s] = ss || null;
}

hfsm.prototype.addSuperState = function(ss) {
	this.membership[ss] = {};
	this.enter[ss] = [];
	this.leave[ss] = [];
}

hfsm.prototype.addEdge = function(from, to, on) {
	this.table[from][on] = to;
}

hfsm.prototype.send = function(action) {
	var t = this.table[this.state];
	if(!t) return false;
	
	var to = t[action];
	if(!t) return false;
	
	this.leave[this.state].map(exec);
	this.enter[to].map(exec);
	
	var nss = this.getSS(to);
	var oss = this.getSS(this.state);
	
	if(nss != oss) { // need to check null == null logic here
		this.leave[oss].map(exec);
		this.enter[nss].map(exec);
	}
	
	this.state = to;
	return true;
}

hfsm.prototype.getSS = function(state) {
	return this.membership[state];
}

hfsm.prototype.enter = function(state, fn) {
	this.enter[state].push(fn);
}

hfsm.prototype.leave = function(state, fn) {
	this.leave[state].push(fn);
}
























