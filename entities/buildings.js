 

Entities.susieshouse = {
	'building': 1,
	'collidable': 1,
	'aabb': {t: 128/64, b: -128/64, l: -160/64, r: 160/64 },
	'position': {x: 120, y:130},
	'sprite': {img: 'susieshouse', zoom:1.0, angle: 0},
};



Entities.stand = {
	'building': 1,
	'collidable': 1,
	'sells': ['lemonade'],
	'prices': { lemonade: 1.5 },
	
	'serviceLines': [pt(0, 25/60)],
	
	'aabb': {t: 20/64, b: -20/64, l: -20/64, r: 32/64 },
	'position': {x: 124, y:125},
	'sprite': {img: 'stand', zoom:1.0, angle: 0},
	
};



