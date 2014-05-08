



Systems.checkCollisions = function() {
	
	var colliders = game.components.collides;
	var collidees = game.components.collidable;
	
	// old ugly way... need to update
	for(var eid in colliders) { if(colliders.hasOwnProperty(eid)) {
		
		var oldpos = game.getComp(eid, 'position');
		var nextpos = game.getComp(eid, 'nextpos');
		var aabb_rel = game.getComp(eid, 'aabb');
		
		// world coord aabb
		var aabb = {
			t: aabb_rel.t + nextpos.y,
			b: aabb_rel.b + nextpos.y,
			l: aabb_rel.l + nextpos.x,
			r: aabb_rel.r + nextpos.x,
		};
		
		for(var ceid in collidees) { if(collidees.hasOwnProperty(ceid)) {
			
			var pos2 = game.getComp(ceid, 'position');
			var aabb_rel2 = game.getComp(ceid, 'aabb');
			
			var aabb2 = {
				t: aabb_rel2.t + pos2.y,
				b: aabb_rel2.b + pos2.y,
				l: aabb_rel2.l + pos2.x,
				r: aabb_rel2.r + pos2.x,
			};
			
			// check box collision
			if(intersectRect(aabb, aabb2)) {
				//console.log('collided');
				// just don't let it move for now...
				nextpos.x = oldpos.x;
				nextpos.y = oldpos.y;
				
			}
		}}
		
	}}
	
}