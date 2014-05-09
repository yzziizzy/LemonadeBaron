


/*

proper game init and run states
add houses to grid
update collisions to use grid

figure out something with the paths

people standing in line
where for employees to stand
thirst logic

inventory screens
store  screens

quadtree for collisions

framerate throttle

thought bubbles?



assets needed:
	grass texture
	dirt texture
	gravel texture
	sidewalk textures
	road textures
	alley textures
	stands
	houses


*/



// why can't browsers just get along?
window.requestAnimFrame = (function(){
	return window.requestAnimationFrame	|| 
		window.webkitRequestAnimationFrame	|| 
		window.mozRequestAnimationFrame		|| 
		window.oRequestAnimationFrame		|| 
		window.msRequestAnimationFrame		|| 
		function(callback){
			window.setTimeout(callback, 1000 / 30);
			};
})();



// asset loading
var img_to_load = {
	grass: 'textures/ground/grass.png',
	debug_grass: 'textures/ground/debug-grass.png',
	road: 'textures/ground/debug_road.png',
	debug_road: 'textures/ground/debug_road.png',
	debug_sidewalk: 'textures/ground/sidewalk_0101.png',
 	sidewalk_0000: 'textures/ground/sidewalk_0000.png',
 	sidewalk_0001: 'textures/ground/sidewalk_0001.png',
 	sidewalk_0010: 'textures/ground/sidewalk_0010.png',
 	sidewalk_0011: 'textures/ground/sidewalk_0011.png',
 	sidewalk_0100: 'textures/ground/sidewalk_0100.png',
 	sidewalk_0101: 'textures/ground/sidewalk_0101.png',
 	sidewalk_0110: 'textures/ground/sidewalk_0110.png',
 	sidewalk_0111: 'textures/ground/sidewalk_0111.png',
 	sidewalk_1000: 'textures/ground/sidewalk_1000.png',
 	sidewalk_1001: 'textures/ground/sidewalk_1001.png',
 	sidewalk_1010: 'textures/ground/sidewalk_1010.png',
 	sidewalk_1011: 'textures/ground/sidewalk_1011.png',
 	sidewalk_1100: 'textures/ground/sidewalk_1100.png',
 	sidewalk_1101: 'textures/ground/sidewalk_1101.png',
 	sidewalk_1110: 'textures/ground/sidewalk_1110.png',
 	sidewalk_1111: 'textures/ground/sidewalk_1111.png',
	susie: 'textures/susie.png',
	susieshouse: 'textures/susieshouse.png',
	stand: 'textures/debug_stand.png',
}
var images = {};

$(function() {
	var imgs = Object.keys(img_to_load).length;
	function loadcb() {
		imgs--;
		if(imgs == 0) {
			$('.loading').hide();
			$('.intro').show();
		}
	}
	
	for(var k in img_to_load) {
		images[k] = new Image();
		images[k].onload = loadcb;
		images[k].src = img_to_load[k];
	}
});






































































 
