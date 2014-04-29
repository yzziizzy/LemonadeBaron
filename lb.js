


/*

map scrolling needed....





assets needed:
	grass texture
	dirt texture


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
	susie: 'textures/susie.png',
	susieshouse: 'textures/susieshouse.png',
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






































































 
