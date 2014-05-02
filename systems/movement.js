

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


// Systems.userControl = function() {
// 	
// 	var ii = game.input;
// 	
// 	
// 	var movers = game.components.controllable;
// 	
// 	for(var eid in movers) { if(movers.hasOwnProperty(eid)) { var mover = movers[eid];
// 		
// 		var urge = game.getComp(eid, 'urge');
// 		urge.acc = 0;
// 		urge.x = 0;
// 		urge.y = 0;
// 		
// 		if(ii.down[37]) {
// 			//console.log(ii);
// 			urge.x = -1;
// 			urge.acc = 1;
// 		}
// 		if(ii.down[39]) {
// 			//console.log(ii);
// 			urge.x = 1;
// 			urge.acc = 1;
// 		}
// 		if(ii.down[38]) {
// 			//console.log(ii);
// 			urge.y = 1;
// 			urge.acc = 1;
// 		}
// 		if(ii.down[40]) {
// 			//console.log(ii);
// 			urge.y = -1;
// 			urge.acc = 1;
// 		}
// 		
// 		// debug
// 	//	urge.x = -1;
// 	//	urge.acc = 2;
// 		
// 	}};
// 	
// 	
// }


Systems.userControl = function() {
	
	var ii = game.input;
	
	var comps = ['controllable'];
	
	runSystem(game.c, comps, function(ent, eid) {
		if(ii.clicked !== null) {
			
			game.addComponent(eid, 'goTo', ptc(ii.clicked));
		}
		
	});
	
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







Systems.goTo = function() {
	
	var comps = ['goTo', 'velocity', 'position', 'maxSpeed', 'acceleration', 'state'];
	
	var epsilon = .1;
	
	runSystem(game.c, comps, function(ent) {
		if(ent.goTo == null) return;
		if(vDist(ent.goTo, ent.position) < epsilon) {
			ent.acceleration.x = 0;
			ent.acceleration.y = 0;
			ent.velocity.x = 0;
			ent.velocity.y = 0;
			// neet to set some state for the ai here...
			ent.state.loco = 'standing';
		}
		else {
		
			var a = ent.maxSpeed * 8;
			
			var dir = norm(ent.goTo.x - ent.position.x, ent.goTo.y - ent.position.y);
			
			ent.acceleration.x = a * dir.x; 
			ent.acceleration.y = a * dir.y; 
			
			ent.state.loco = 'going';
		}
		
	});
	
};

Systems.acceleration = function(te) {
	
	var comps = ['acceleration', 'velocity', 'maxSpeed'];

	runSystem(game.c, comps, function(ent) {
		
		var x = ent.velocity.x + ent.acceleration.x * te;
		var y = ent.velocity.y + ent.acceleration.y * te;
		var speed = vecLen(x,y);
		
		// need better integrator
		if(abs(speed) < ent.maxSpeed) {
			ent.velocity.x = x;
			ent.velocity.y = y;
		}
		else {
			var dir = norm(x,y)
			ent.velocity.x = dir.x * ent.maxSpeed;
			ent.velocity.y = dir.y * ent.maxSpeed;
		}
		
	});
	
};

Systems.velocity = function(te) {
	
	var comps = ['velocity', 'position', 'nextpos'];

	runSystem(game.c, comps, function(ent) {
		
		// need better integrator
		ent.nextpos.x = ent.position.x + te * ent.velocity.x;
		ent.nextpos.y = ent.position.y + te * ent.velocity.y;
	});
	
};



Systems.lookAt = function() {
	
	var comps = ['lookAt', 'sprite'];

	runSystem(game.c, comps, function(ent, eid) {
		
		var dir = game.getComp(eid, ent.lookAt);
		
		if(dir.x == 0 && dir.y == 0) return;
		
		dir = ptNorm(dir);
		
		// need better integrator
		ent.sprite.angle = atan2(
			dir.x,
			dir.y  
		);
	});
	
};



// you can add your own trip timers in there
Systems.odometer = function(te) {
	
	var comps = ['nextpos', 'position', 'odometer'];

	runSystem(game.c, comps, function(ent) {
		
		// need better integrator
		var len = vDist(ent.nextpos, ent.position);
		for(var i in ent.odometer) {
			ent.odometer[i] += len;
		};
		
	});
	
};



