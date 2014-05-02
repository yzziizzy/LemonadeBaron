


/*

people standing in line
where for employees to stand
street-walking logic
thirst logic

inventory screens
store  screens





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
	debug_grass: 'textures/ground/debug-grass.png',
	debug_road: 'textures/ground/debug_road.png',
	debug_sidewalk: 'textures/ground/debug_sidewalk.png',
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






































































 
