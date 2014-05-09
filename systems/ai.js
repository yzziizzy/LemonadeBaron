


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
		
		game.setComp(eid, 'thirst', t > 50); // weird shit here, dunno what I was originally thinking
		game.addComponent(eid, 'thirsty', t > 50);
		console.log('thirst: ' + ent.thirst);
// 		if(t > 50) {
// 			console.log('person is thirsty');
// 		}
		
		ent.odometer.lastDrink = t;
		
	});
	
	
}


Systems.ai.thirsty_LocateStand = function() {
	
	var comps = ['thirsty', 'position'];

	runSystem(game.c, comps, function(ent, eid) {
			
		var l = game.grid.rangeRadiusFast(ent.position, 2);
			console.log('looking for stand: ' + l.length);
		
		for(var i = 0; i < l.length; i++) {
			var ee = l[i];
			
			if(game.getComp(ee, 'sells')) {
				// this is a stand
				
				game.addComponent(eid, 'queuedAt', ee);
				console.log('queuing up at');
				
				var vel = game.getComp(eid, 'velocity');
				vel.x = 0;
				vel.y = 0;
				
				var state = game.getComp(eid, 'state');
				state.loco = 'standing';
				
				game.removeComp(eid, 'goTo');
				
				break;
			}
		}
		
	});
	
	
}



Systems.ai.buyDrink = function() {
	
	var comps = ['queuedAt'];
	
	runSystem(game.c, comps, function(ent, eid) {
		
		var stand = ent.queuedAt;
		var s_inv = game.getComp(stand, 'inventory');
			console.log('in queue');
		
		if(stand.lemonade > 0) {
			console.log('buying');
			
			// increment player cash
			var price = game.getComp(stand, 'prices');
			var pc = game.firstEntityWith('playerOwned');
			var cash = game.getComp(pc, 'cash');
			game.setComp(pc, 'cash', cash + price);
			
			s_inv.lemonade--;
			
			game.removeComp(eid, 'thirsty');
			game.removeComp(eid, 'queuedAt');
			var c_state = game.getComp(eid, 'state');
			c_state.loco = 'standing';
			game.setComp(eid, 'thirst', 0);
			var odo = game.getComp(eid, 'odometer');
			odo.lastDrink = 0;
		}
		
		
		
	});
	
}