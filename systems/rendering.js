


Systems.drawActors = function(ctx, view, center) {
	
	var sprites =  game.components.sprite;
	
	var cwidth = view.width;
	var cheight = view.height;

	ctx.save();
	ctx.translate(cwidth / 2, cheight / 2);
	
	for(var eid in sprites) { if(sprites.hasOwnProperty(eid)) {
		
		ctx.save();
		
		var pos = game.getComp(eid, 'position');
		var img = game.getComp(eid, 'sprite');
		//var cc =  game.map.mapToCanvas(center, pos.x, pos.y); 
		
		var z = img.zoom || 1;
		
		var cx = ((center.x - pos.x) * -64);
		var cy = ((center.y - pos.y) * 64);
	
		ctx.translate(cx,cy);
		ctx.rotate(img.angle);
		ctx.scale(z,z);
		ctx.translate(images[img.img].width / -2, images[img.img].height / -2);
		ctx.drawImage(images[img.img], 0,0);
		
		ctx.restore();
	}};
	
	
	ctx.restore();
	
}



// dead code
// Systems.move = function(te) {
// 	//return;
// 	var movers = game.components.velocity;
// 	
// 	for(var eid in movers) { if(movers.hasOwnProperty(eid)) { var vel = movers[eid];
// 		
// 		var oldpos = game.getComp(eid, 'position');
// 		var nextpos = game.getComp(eid, 'nextpos');
// 		
// 		// references...
// 		nextpos.x = oldpos.x + vel.x * te; 
// 		nextpos.y = oldpos.y + vel.y * te; 
// 	}};
// 	
// 	
// }



 
