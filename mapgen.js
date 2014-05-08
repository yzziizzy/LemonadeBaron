




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
	
	
	renderToTexmap();
	
	
	
	function genblock(target) {
	
		
		
		var house = game.spawn(Entities.susieshouse);
		game.setComp(house, 'position', {x: target.x, y: target.y });
		
		
		map.fillRectLay(target.x - 6, target.y - 6, target.x + 6, target.y + 6, 'road');
		map.fillRectLay(target.x - 5, target.y - 5, target.x + 5, target.y + 5, 'sidewalk');
		map.fillRectLay(target.x - 4, target.y - 4, target.x + 4, target.y + 4, 'grass');
		
	//	map.andLayAt(121, 127, 'sidewalk'); 
		map.orLayAt(target.x - 5, target.y + 6, 'sidewalk'); 
		map.orLayAt(target.x + 5, target.y + 6, 'sidewalk'); 
		map.orLayAt(target.x - 6, target.y + 5, 'sidewalk'); 
		map.orLayAt(target.x + 6, target.y + 5, 'sidewalk'); 
		map.orLayAt(target.x - 5, target.y - 6, 'sidewalk'); 
		map.orLayAt(target.x + 5, target.y - 6, 'sidewalk'); 
		map.orLayAt(target.x - 6, target.y - 5, 'sidewalk'); 
		map.orLayAt(target.x + 6, target.y - 5, 'sidewalk'); 
		
		
	}
	
	
	
	function above(x,y) {
		if(y >= map.size.y - 1) return -1;
		return x + (y+1)* map.size.x;
	}
	function below(x,y) {
		if(y <= 0) return -1;
		return x + (y-1)* map.size.x;
	}
	function right(x,y) {
		if(x >= map.size.x - 1) return -1;
		return (x+1) + y * map.size.x;
	}
	function left(x,y) {
		if(x <= 0) return -1;
		return (x-1) + y * map.size.x;
	}
	
	function isAbove(x, y, t) {
		if(y >= map.size.y - 1) return 0;
		return map.layout[x + (y+1)* map.size.x] & t ? 1 : 0;
	}
	function isBelow(x, y, t) {
		if(y <= 0) return 0;
		return map.layout[x + (y-1)* map.size.x] & t ? 1 : 0;
	}
	function isRight(x, y, t) {
		if(x >= map.size.x - 1) return 0;
		return (map.layout[(x+1) + y * map.size.x]|0) & (t|0) ? 1 : 0;
	}
	function isLeft(x, y, t) {
		if(x <= 0) return 0;
		return map.layout[(x-1) + y * map.size.x] & t ? 1 : 0;
	}
	
	function getAt(x, y) {
		return map.layout[x + y * map.size.x];
	}
	
	
	
	
	function resolveTile(x, y) {
		
		var t = getAt(x, y);
		
		var tinfo = map.texLayMapping[map.layoutCodes_inv[t]];
		
		// return out on simple textures
		if(typeof tinfo == 'string') {
			return map.texImgMapping_inv[tinfo];// the tex code for the string name
		}
		
		// fancy directional tiles like sidewalks
		if(tinfo.type == 'directional') {
			var N = isAbove(x, y, t),
				S = isBelow(x, y, t),
				E = isRight(x, y, t),
				W = isLeft(x, y, t);
			
			var suffix = N + '' + S + '' + E + '' + W;
			
			return map.texImgMapping_inv[tinfo.prefix + '' + suffix];
		}
		
		
		
	}
	
	
	
	
	function renderToTexmap() {
		for(var y = 0; y < map.size.y; y++) {
			for(var x = 0; x < map.size.x; x++) {
				
				
				map.texCodes[x + y * map.size.x] = resolveTile(x, y);
			}
		}
		
		
		
		
		
	}
	
	
}



















