




var MapGen_1 =  function(map, game) {
	
	
	//map.texCodes[128+ (128*256)] = 1;
	
	
	// make some blocks
	for(var x = 098; x <= 137; x+= 13) { 
		for(var y = 095; y <= 137; y+= 13) { 
			
			genblock(pt(x,y));
		}
	}
	
	var n1 = game.aiPaths.addNode(pt(119,126));
	var n2 = game.aiPaths.addNode(pt(129,126));
	var n3 = game.aiPaths.addNode(pt(129,116));
	var n4 = game.aiPaths.addNode(pt(119,116));
	game.aiPaths.addEdge(n1, n2, true);
	game.aiPaths.addEdge(n2, n3, true);
	game.aiPaths.addEdge(n3, n4, true);
	game.aiPaths.addEdge(n4, n1, true);
	
	
	
	function genblock(target) {
	
		
		
		var house = game.spawn(Entities.susieshouse);
		game.setComp(house, 'position', {x: target.x, y: target.y });
		
		
		map.fillRectTex(target.x - 7, target.y - 7, target.x + 7, target.y + 7, 'road');
		map.fillRectTex(target.x - 5, target.y - 5, target.x + 5, target.y + 5, 'sidewalk');
		map.fillRectTex(target.x - 4, target.y - 4, target.x + 4, target.y + 4, 'grass');
		
		
	}
	
	
	
	
}



















