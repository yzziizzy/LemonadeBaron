


Entities.susie = {
	'controllable': 1,
	'player': 1,
	'mapFollows': {margin: 3} , // in map units
	'collides': 1,
	'aabb': {t:20/64, b: -20/64, l: -20/64, r: 20/64},
	'position': {x: 126, y:126},
	'nextpos': {x: 126, y:126},
	'velocity': {x: 0, y:0},
	'acceleration': {x: 0, y:0},
	'maxSpeed': 1,
	'state': {loco: 'standing'},
	'movable': {pos: {x:126,y:126}, vel:{x:0,y:0}, acc:{x:0,y:0}},
	'urge': {x: 0, y:0, acc: 0, drag: 1000},
	'lookAt': 'velocity',
	'sprite': {img: 'susie', zoom:2.0, angle: 0},
};




Entities.customer1 = {
	'collides': 1,
	'aabb': {t:10/64, b: -10/64, l: -10/64, r: 10/64},
	'position': {x: 123, y:126},
	'nextpos': {x: 123, y:126},
	'velocity': {x: 0, y:0},
	'acceleration': {x: 0, y:0},
	'maxSpeed': 1,
	'state': {loco: 'standing'},
	'thirst': 0,
	'movable': {pos: {x:126,y:126}, vel:{x:0,y:0}, acc:{x:0,y:0}},
	'urge': {x: 0, y:0, acc: 0, drag: 1000},
	'lookAt': 'velocity',
	'odometer': {allTime: 0},
	'sprite': {img: 'susie', zoom:2.0, angle: 0},
};




 
