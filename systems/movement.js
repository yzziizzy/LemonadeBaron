

Systems.urge = function(te) {
	
	var moves = game.components.movable;
	var positions = game.components.position;
	var velocities = game.components.velocity;
//	var accelerations = game.components.acceleration;
	var urges = game.components.urge;
	
	for(var eid in moves) { 
		if(moves.hasOwnProperty(eid) && 
			positions.hasOwnProperty(eid) &&
			velocities.hasOwnProperty(eid) &&
	//		accelerations.hasOwnProperty(eid) &&
			urges.hasOwnProperty(eid)) { 
			
			
			var move = moves[eid];
			var pos = positions[eid];
			var vel = velocities[eid];
			var urge = urges[eid];
			var nextpos = game.getComp(eid, 'nextpos');
			
			if(urge.acc) {
				nextpos.x = pos.x + urge.x * te * urge.acc;
				nextpos.y = pos.y + urge.y * te * urge.acc;
				
				
			}
			
			
			
		}
	}
	
}


Systems.userControl = function() {
	
	var ii = game.input;
	
	
	var movers = game.components.controllable;
	
	for(var eid in movers) { if(movers.hasOwnProperty(eid)) { var mover = movers[eid];
		
		var urge = game.getComp(eid, 'urge');
		urge.acc = 0;
		urge.x = 0;
		urge.y = 0;
		
		if(ii.down[37]) {
			//console.log(ii);
			urge.x = -1;
			urge.acc = 1;
		}
		if(ii.down[39]) {
			//console.log(ii);
			urge.x = 1;
			urge.acc = 1;
		}
		if(ii.down[38]) {
			//console.log(ii);
			urge.y = 1;
			urge.acc = 1;
		}
		if(ii.down[40]) {
			//console.log(ii);
			urge.y = -1;
			urge.acc = 1;
		}
		
		// debug
	//	urge.x = -1;
	//	urge.acc = 2;
		
	}};
	
	
}




Systems.mapFollows = function() {
	
	var follows = game.components.mapFollows;
	
	var edges = game.map.getEdges(game.mapCenter);
	
	for(var eid in follows) { if(follows.hasOwnProperty(eid)) { var follow = follows[eid];
		
		var pos = game.getComp(eid, 'position');
		
		if(pos.y > edges.t - follow.margin) {
			// move the map up
			game.mapCenter.y +=  pos.y - (edges.t - follow.margin);
		}
		if(pos.y < edges.b + follow.margin) {
			// move the map down
			game.mapCenter.y -= edges.b + follow.margin - pos.y;
		}
		if(pos.x > edges.r - follow.margin) {
			// move the map up
			game.mapCenter.x +=  pos.x - (edges.r - follow.margin);
		}
		if(pos.x < edges.l + follow.margin) {
			// move the map down
			game.mapCenter.x -= edges.l + follow.margin - pos.x;
		}
		
		break; // only follow the first guy. really bad temp hack, but whatever
	}}
	
	
}

















