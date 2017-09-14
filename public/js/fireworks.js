let sparks = [];
let blown = [];
let up = 0,
	down = 0,
	left = 0,
	right = 0;
let color_groups = [];
let s_group = new THREE.Group();
let main_group = new THREE.Group();
let title = document.getElementById('title');
let loading = document.getElementById('loading');
let progress = document.getElementById('progress');
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200000 );
let light = new THREE.PointLight(0xffffff, 0.5);
let sky = new THREE.Sky();
scene.add( sky.mesh );
light.position.y = 5000
scene.add( light );
scene.add( new THREE.AmbientLight(0xffffff, 0.5) );
camera.position.z = 15000;
let renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setClearColor( 0x000000 );
renderer.autoclear = false;
let stats = new Stats();
document.body.append( stats.dom )
let controls = new THREE.TrackballControls( camera );
let listener = new THREE.AudioListener();
camera.add( listener );
let sound = new THREE.Audio( listener );
let audioLoader = new THREE.AudioLoader();

//sad.mp3 touch.mp3 Fake.wav woah.mp3

audioLoader.load( 'music/woah.mp3', ( buffer ) => {
	sound.setBuffer( buffer );
	sound.setLoop(true);
	sound.setVolume(1);
  title.style.opacity = 1;
  let fade_int = setInterval(() => {
		if ( title.style.opacity >= 0 ) {
			title.style.opacity -= 0.05;
		} else {
			sound.play();
			title.remove();
			clearInterval( fade_int );
		}
	}, 10);
}, ( xhr ) => {
	let perc = (xhr.loaded / xhr.total * 100);
	let loaded = 'Loading: ' + Math.floor(perc) + '%';
	progress.style.width = ( (perc * 10) / 10 ) + '%';
	loading.innerHTML = loaded;
}, ( xhr ) => {
	loading.innerHTML = '<span style="color: red;">An error has occured.</span>';
}
);

let analyser = new THREE.AudioAnalyser( sound, 32 );
document.body.append( renderer.domElement );

function random ( min, max, sign ) {

  let rn = Math.floor((Math.random() * max) + min);

  if ( sign )
    rn *= Math.floor(Math.random()*2) == 1 ? 1 : -1;

  return rn;

};

class explodingLorenzAttractor {
	color( pct ) {

		for (var i = 1; i < this.colors.length - 1; i++) {
      if (pct < this.colors[i].pct) {
        break;
      }
    }

    let lower = this.colors[i - 1];
    let upper = this.colors[i];
    let range = upper.pct - lower.pct;
    let rangePct = (pct - lower.pct) / range;
    let pctLower = 1 - rangePct;
    let pctUpper = rangePct;
    let color = {
        r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
        g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
        b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
    };
    return '0x' + componentToHex(color.r) + componentToHex(color.g) + componentToHex(color.b);
	}

	draw () {
		let dx = (this.a * ( this.y - this.x )) * this.t;
		let dy = (this.x * ( this.b - this.z ) - this.y) * this.t;
		let dz = (this.x * this.y - this.c * this.z) * this.t;
		this.x = this.x + dx;
		this.y = this.y + dy;
		this.z = this.z + dz;
		return {x: this.x + this.origin.x, y: this.y + this.origin.y, z: this.z + this.origin.z};
	}

	update () {
		let spectrum = analyser.getFrequencyData();
		for (let i = 0; i < this.color_groups.length; i++) {
			this.color_groups[i].children[0].material.color.setHex( this.color( spectrum[i] / 255 ) );
		}
	}

	explode ( time ) {
		if ( this.nuked == false ) {
			for ( let i = 0; i < this.sparks.length; i++ ) {
				let tween = new TWEEN.Tween(this.sparks[i].position).to(this.blown[i], time).easing(TWEEN.Easing.Exponential.Out).onComplete(() => { this.nuked = true });
				tween.start();
			}
		}
	}

	implode ( time ) {
		if ( this.nuked == true ) {
			for ( let i = 0; i < this.sparks.length; i++ ) {
				let tween = new TWEEN.Tween(this.sparks[i].position).to(this.origin, time).easing(TWEEN.Easing.Exponential.Out).onComplete(() => { this.nuked = false });
				tween.start();
			}
		}
	}

	constructor ( vars, origin, colors, n ) {
		//{a: 1, b: 1, c: 1, t: 1}
		this.a = vars.a;
		this.b = vars.b;
		this.c = vars.c;
		this.colors = colors;
		this.t = vars.t;
		this.dt = vars.t;
		this.origin = {x: origin.x, y: origin.y, z: origin.z};
		this.x = 1;
		this.y = 1;
		this.z = 1;
		this.color_groups = [];
		this.sprite_materials = [];
		this.blown = [];
		this.sparks = [];
		this.lorenz_attractor = new THREE.Group();
		this.nuked = false;
		let pointGeometry = new THREE.Geometry();
		let apoint = new THREE.Vector3();
		apoint.x = 0;
		apoint.y = 0;
		apoint.z = 0;
		pointGeometry.vertices.push( apoint );
		let average = (n - (n % 16)) / 16;

		for ( let i = 0; i < 16; i++ ) {
			let group = new THREE.Group();
			this.color_groups.push( group );
			this.sprite_materials.push( new THREE.PointsMaterial({color: 0xffffff}) );
		}


		for (let i = 0; i < n; i++) {

			let coordinates = this.draw();
			let group;
			this.blown.push( coordinates );

			if ( Math.floor( i / average )  > 15) {
				group = 15;
			} else {
				group = Math.floor( i / average );
			}

			let sprite = new THREE.Points( pointGeometry, this.sprite_materials[group] );
			sprite.position.x = origin.x;
			sprite.position.y = origin.y;
			sprite.position.z = origin.z;
			this.color_groups[group].add( sprite );
			this.sparks.push( sprite );

		}

		for ( let i = 0; i < this.color_groups.length; i++ ) {
			scene.add( this.color_groups[i] );
			console.log( this.color_groups[i] );
		}

		this.blown.reverse();

	}
};

class Fractal {
  color( pct ) {
    for (var i = 1; i < this.colors.length - 1; i++) {
        if (pct < this.colors[i].pct) {
            break;
        }
    }
    let lower = this.colors[i - 1];
    let upper = this.colors[i];
    let range = upper.pct - lower.pct;
    let rangePct = (pct - lower.pct) / range;
    let pctLower = 1 - rangePct;
    let pctUpper = rangePct;
    let color = {
        r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
        g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
        b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
    };
    return '0x' + componentToHex(color.r) + componentToHex(color.g) + componentToHex(color.b);
  }

  update () {
    let spectrum = analyser.getFrequencyData();
    for (let i = 0; i < this.point_materials.length; i++) {
      let color = this.color( spectrum[i] / 255 );
      this.point_materials[i].color.setHex( color );
      this.point_materials[i].emissive.setHex( color );
      this.point_materials[i].emissiveIntensity = spectrum[i] / 255;
    }
  }

  constructor ( formula, origin, colors, n ) {
    this.colors = colors;
    this.origin = {x: origin.x, y: origin.y, z: origin.z};
    this.point_shapes = [];
    this.point_materials = [];
    this.fractal = new THREE.Group();
    this.nuked = false;
    let average = (n - (n % 16)) / 16;

    for ( let i = 0; i < 16; i++ ) {
      let shape = new THREE.Geometry();
      this.point_shapes[i] = shape ;
      this.point_materials[i] = new THREE.MeshPhongMaterial();
    }

    for (let i = 0; i < n; i++) {

      let coordinates = formula( i );
      let group;

      let point = new THREE.Vector3();
      point.x = coordinates.x + origin.x;
      point.y = coordinates.y + origin.y;
      point.z = coordinates.z + origin.z;

      if ( Math.floor( i / average )  > 15) {
        group = 15;
      } else {
        group = Math.floor( i / average );
      }

      this.point_shapes[ group ].vertices.push( point );

    }

    for ( let i = 0; i < this.point_shapes.length; i++ ) {
      /*
      console.log( i + '.', this.point_shapes[i] );
      console.log( i + '.', this.point_materials[i] );
      */
      let points = new THREE.Points( this.point_shapes[i], this.point_materials[i] );
      console.log( points );
      this.fractal.add( points );
    }

    scene.add( this.fractal );

  }
};

class LorenzAttractor {
	color( pct ) {
		for (var i = 1; i < this.colors.length - 1; i++) {
        if (pct < this.colors[i].pct) {
            break;
        }
    }
    let lower = this.colors[i - 1];
    let upper = this.colors[i];
    let range = upper.pct - lower.pct;
    let rangePct = (pct - lower.pct) / range;
    let pctLower = 1 - rangePct;
    let pctUpper = rangePct;
    let color = {
        r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
        g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
        b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
    };
    return '0x' + componentToHex(color.r) + componentToHex(color.g) + componentToHex(color.b);
	}

	draw () {
		let dx = (this.a * ( this.y - this.x )) * this.t;
		let dy = (this.x * ( this.b - this.z ) - this.y) * this.t;
		let dz = (this.x * this.y - this.c * this.z) * this.t;
		this.x = this.x + dx;
		this.y = this.y + dy;
		this.z = this.z + dz;
		return {x: this.x + this.origin.x, y: this.y + this.origin.y, z: this.z + this.origin.z};
	}

	update () {
		let spectrum = analyser.getFrequencyData();
		for (let i = 0; i < this.point_materials.length; i++) {
			let color = this.color( spectrum[i] / 255 );
			this.point_materials[i].color.setHex( color );
			this.point_materials[i].emissive.setHex( color );
			this.point_materials[i].emissiveIntensity = spectrum[i] / 255;
		}
	}

	constructor ( vars, origin, colors, n ) {
		//{a: 1, b: 1, c: 1, t: 1}
		this.a = vars.a;
		this.b = vars.b;
		this.c = vars.c;
		this.colors = colors;
		this.t = vars.t;
		this.dt = vars.t;
		this.origin = {x: origin.x, y: origin.y, z: origin.z};
		this.x = 1;
		this.y = 1;
		this.z = 1;
		this.point_shapes = [];
		this.point_materials = [];
		this.lorenz_attractor = new THREE.Group();
		this.nuked = false;
		let average = (n - (n % 16)) / 16;

		for ( let i = 0; i < 16; i++ ) {
			let shape = new THREE.Geometry();
			this.point_shapes[i] = shape ;
			this.point_materials[i] = new THREE.MeshPhongMaterial();
		}

		for (let i = 0; i < n; i++) {

			let coordinates = this.draw();
			let group;

			let point = new THREE.Vector3();
			point.x = coordinates.x;
			point.y = coordinates.y;
			point.z = coordinates.z;

			if ( Math.floor( i / average )  > 15) {
				group = 15;
			} else {
				group = Math.floor( i / average );
			}

			this.point_shapes[ group ].vertices.push( point );

		}

		for ( let i = 0; i < this.point_shapes.length; i++ ) {
			/*
			console.log( i + '.', this.point_shapes[i] );
			console.log( i + '.', this.point_materials[i] );
			*/
			let points = new THREE.Points( this.point_shapes[i], this.point_materials[i] );
			console.log( points );
			scene.add( points );
		}

		console.log( this.point_materials[0] );

	}
};

class HalvorsenAttractor {
	color( pct ) {
		for (var i = 1; i < this.colors.length - 1; i++) {
        if (pct < this.colors[i].pct) {
            break;
        }
    }
    let lower = this.colors[i - 1];
    let upper = this.colors[i];
    let range = upper.pct - lower.pct;
    let rangePct = (pct - lower.pct) / range;
    let pctLower = 1 - rangePct;
    let pctUpper = rangePct;
    let color = {
        r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
        g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
        b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
    };
    return '0x' + componentToHex(color.r) + componentToHex(color.g) + componentToHex(color.b);
	}

	draw () {
		let dx = ( Math.sin( this.y ) - ( this.b * this.x ) ) * this.t;
		let dy = ( Math.sin( this.z ) - ( this.b * this.y ) ) * this.t;
		let dz = ( Math.sin( this.x ) - ( this.b * this.z ) ) * this.t;
		this.x = this.x + dx;
		this.y = this.y + dy;
		this.z = this.z + dz;
		return {x: (this.x * this.m) + this.placement.x, y: (this.y * this.m) + this.placement.y, z: (this.z * this.m) + this.placement.z};
	}

	update () {
		let spectrum = analyser.getFrequencyData();
		for (let i = 0; i < this.point_materials.length; i++) {
			let color = this.color( spectrum[i] / 255 );
			this.point_materials[i].color.setHex( color );
			this.point_materials[i].emissive.setHex( color );
			this.point_materials[i].emissiveIntensity = spectrum[i] / 255;
		}
	}

	constructor ( vars, origin, placement, colors, m, n ) {
    //{b: b < 1, t: 1}
		this.colors = colors;
		this.m = m;
		this.placement = placement;
    this.b = vars.b;
		this.t = vars.t;
		this.x = origin.x;
		this.y = origin.y;
		this.z = origin.z;
		this.point_shapes = [];
		this.point_materials = [];
		this.halvorsen_attractor = new THREE.Group();
		this.nuked = false;
		let average = (n - (n % 16)) / 16;

		for ( let i = 0; i < 16; i++ ) {
			let shape = new THREE.Geometry();
			this.point_shapes[i] = shape ;
			this.point_materials[i] = new THREE.MeshPhongMaterial();
		}

		for (let i = 0; i < n; i++) {

			let coordinates = this.draw();
			let group;

			let point = new THREE.Vector3();
			point.x = coordinates.x;
			point.y = coordinates.y;
			point.z = coordinates.z;

			if ( Math.floor( i / average )  > 15) {
				group = 15;
			} else {
				group = Math.floor( i / average );
			}

			this.point_shapes[ group ].vertices.push( point );

		}

		for ( let i = 0; i < this.point_shapes.length; i++ ) {
			/*
			console.log( i + '.', this.point_shapes[i] );
			console.log( i + '.', this.point_materials[i] );
			*/
			let points = new THREE.Points( this.point_shapes[i], this.point_materials[i] );
			console.log( points );
			this.halvorsen_attractor.add( points );
		}

		scene.add( this.halvorsen_attractor );

	}
};

function sort_colors ( mats, average, interval ) {

	let group;

	if ( Math.floor( interval/average )  > 15) {
		group = 15;
	} else {
		group = Math.floor( interval / average );
	}

	let the_sprite = new THREE.Sprite( mats[group] );
	the_sprite.scale.set( 1, 1, 1 );
	the_sprite.position.set( 0, 0, 0 );
	color_groups[ group ].add( the_sprite );
	sparks.push( the_sprite );

}

function create_fractal ( n, cb ) {

	//The callback is meant to take a numerical argument and return a json variable as the 3d position of the sprite as such:
	//{x: 0, y: 0, z: 0}

	color_groups = [];
	let sprite_materials = [];

	for ( let i = 0; i < 16; i++ ) {
		let group = new THREE.Group();
		group.name = i;
		color_groups.push( new THREE.Group() );
		sprite_materials.push( new THREE.SpriteMaterial({color: 0xffffff}) );
	}

	blown = [];
	sparks = [];
	let group_average = (n - (n % 16)) / 16;

	for ( let i = 0; i < n; i++ ) {

		if ( !cb ) {

			//if no formula, put the sprites in random places
			blown.push({x: random( 0, window.innerWidth*2, true ), y: random( 0, window.innerHeight*2, true ), z: random( 0, 3000, true )});

		} else {

			blown.push( cb(i) );

		}

		sort_colors( sprite_materials, group_average, i );

	}

	for ( let i = 0; i < color_groups.length; i++ ) {
		scene.add( color_groups[i] );
	}

	blown.reverse();

};

function update_color () {
	spectrum = analyser.getFrequencyData();
	for (let i = 0; i < color_groups.length; i++) {
		color_groups[i].children[0].material.color.setHex( get_color( spectrum[i] / 255 ) );
	}
}

function nukeit () {
	let tweens = [];
	for ( let i = 0; i < sparks.length; i++ ) {
		let tween = new TWEEN.Tween(sparks[i].position).to(blown[i], 2000).easing(TWEEN.Easing.Exponential.Out).onComplete(() => { nuked = true });
		tween.start();
	}
};

function unnukeit () {
	for ( let i = 0; i < sparks.length; i++ ) {
		let tween = new TWEEN.Tween(sparks[i].position).to({x: 0, y: 0, z: 0}, 2000).easing(TWEEN.Easing.Exponential.In).onComplete(() => { nuked = false });
		tween.start();
	}
};

var percentColors = [
	{ pct: 0, color: { r: 0x50, g: 0xf4, b: 0x42 } },
	{ pct: 0.2, color: { r: 0xf4, g: 0xf4, b: 0x42 } },
	{ pct: 0.4, color: { r: 0x00, g: 0xff, b: 0xff } },
  { pct: 0.7, color: { r: 0x00, g: 0x00, b: 0xff } },
  { pct: 1, color: { r: 0xff, g: 0x00, b: 0x00 } }
];

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function get_color (pct) {
    for (var i = 1; i < percentColors.length - 1; i++) {
        if (pct < percentColors[i].pct) {
            break;
        }
    }
    let lower = percentColors[i - 1];
    let upper = percentColors[i];
    let range = upper.pct - lower.pct;
    let rangePct = (pct - lower.pct) / range;
    let pctLower = 1 - rangePct;
    let pctUpper = rangePct;
    let color = {
        r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
        g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
        b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
    };
    return '0x' + componentToHex(color.r) + componentToHex(color.g) + componentToHex(color.b);
    // or output as hex if preferred
};

function three_average () {
	let num = Math.floor( analyser.getAverageFrequency() * 100 );

	return get_color( num / 10000 );

};

document.addEventListener('keydown', ( e ) => {

	let evnt = window.event ? window.event : e;

	if ( evnt.keyCode == 38 ) {
		up = 2;
	}

	if ( evnt.keyCode == 40 ) {
		down = -2;
	}

	if ( evnt.keyCode == 39 ) {
		left = -2;
	}

	if( evnt.keyCode == 37 ) {
		right = 2;
	}

});

document.addEventListener('keyup', ( e ) => {
	let evnt = window.event ? window.event : e;

	if ( evnt.keyCode == 38 ) {
		up = 0;
	}

	if( evnt.keyCode == 40 ) {
		down = 0;
	}

	if ( evnt.keyCode == 39 ) {
		left = 0;
	}

	if( evnt.keyCode == 37 ) {
		right = 0;
	}

})

//41f4c4

let mx = 1.8;

let first = new LorenzAttractor({a: 512 * mx, b:3072 * mx, c: 128 * mx, t: 0.00009}, {x: -80, y: 0, z: -100}, [
	{ pct: 0, color: { r: 0x41, g: 0xf4, b: 0xc4 } },
	{ pct: 0.5, color: { r: 0x4e, g: 0x42, b: 0xf4 } },
  { pct: 1, color: { r: 0xe5, g: 0x42, b: 0xf4 } }
], 50000);

let second = new HalvorsenAttractor({b: 0.208186, t: 1.5}, {x: 1000, y: 222, z: 456},
	{x: 0, y: 3000, z: 500},
	[
		{ pct: 0, color: { r: 0xf4, g: 0xee, b: 0x42 } },
		{ pct: 0.5, color: { r: 0x41, g: 0xf4, b: 0x68 } },
  	{ pct: 1, color: { r: 0x41, g: 0xdf, b: 0xf4 } }
	],
	20000,
	20000);

let g = new THREE.BoxBufferGeometry( 100, 100, 100 );
let m = new THREE.MeshNormalMaterial(/*{color: 0x290a5b}*/);
let box = new THREE.Mesh( g, m );
scene.add( box );

function animate () {
	//light.intensity = analyser.getFrequencyData()[3] / 255;
	camera.position.z += up + down;
	camera.position.x += left + right;
	//camera.rotation.x += 0.1;
  controls.update();
	box.rotation.x += 0.003;
	box.rotation.y += 0.003;
	first.update();
	second.update();
  TWEEN.update();
	stats.update();
  //console.log( analyser.getFrequencyData()[7] );
	//update_color();
	renderer.render( scene, camera );
	renderer.clearDepth();
  requestAnimationFrame( animate );
};

window.addEventListener('resize', function () {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});


/*
create_fractal(3000, ( i ) => {

	return {x: (Math.sin(i*6) * i), y: (3/150-i) + 600, z: (Math.cos( 5 * i) * i)}
	//return {x: (Math.cos( 5 * i) * i), y: (Math.sin(i*6) * i), z: (3/150-i)};
	//i = i * 0.7;
	//return {x: (Math.sin(i*6) * i), y: (3/150-i) + 600, z: (Math.cos( 5 * i) * i)}
	//return first.draw();
	//return {x: (Math.cos( 5 * i) * i), y: (Math.sin(i*6) * i), z: (3/150-i)}
	//return {x: Math.cos( 5 * i), y: i, z: i};

});
*/

animate();
update_color();
