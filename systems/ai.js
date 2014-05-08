


Systems.ai = Systems.ai || {};


Systems.ai.followPaths = function() {

	var comps = ['ai', 'position', 'state'];

	runSystem(game.c, comps, function(ent, eid) {
		
		if(ent.state.loco == 'standing') {
		
			// get path node near spot.
			var at = game.aiPaths.getNodeNear(ent.position, .8);
			if(null === at) {
				console.log('ai is lost at [' + ent.position.x + ',' + ent.position.y + ']');
			}
			
			// choose random exit
			var to = game.aiPaths.followRandomEdge(at);
			if(!to) {
				console.log('ai is dead ended at [' + ent.position.x + ',' + ent.position.y + ']');
			}
			
			game.addComponent(eid, 'goTo', to);
			ent.state.loco = 'pending';
		}
		
	});


};



Systems.ai.thirst = function() {
	
	var comps = ['thirst', 'odometer'];

	runSystem(game.c, comps, function(ent, eid) {
		
		var t = ent.odometer.lastDrink || 0;
		
		game.setComp(eid, 'thirst', t > 50);
		
		ent.odometer.lastDrink = t;
		
	});
	
	
}
