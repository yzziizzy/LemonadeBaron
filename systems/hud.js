



Systems.hud = Systems.hud || {};



Systems.hud.money = function(te) {
	
	var ctx = game.hudCtx;
	var hudData = game.hudData;
	
	var hudts = game.components.hudTarget;
	
	
	for(var eid in hudts) { if(hudts.hasOwnProperty(eid)) {
		
		var cash = game.getComp(eid, 'cash');
		

		ctx.font = hudData.cash.font;
		ctx.fillStyle = hudData.cash.color;
		
		ctx.fillText('$' + cash, hudData.cash.pos.x, hudData.cash.pos.y);
	
		
		
		
		
		
	}}
	
	
}















