let up = 0,
	down = 0,
	left = 0,
	right = 0,
	tofroMax = 30,
	increments = 0.1,
	sensitivity = 3,
	upint,
	downint,
	leftint,
	rightint;
let playing = false;
let title = document.getElementById('title');
let loading = document.getElementById('loading');
let progress = document.getElementById('progress');
let acceleration = document.getElementById('acceleration');
let scene = new THREE.Scene();
scene.background = new THREE.Color( 0x000000 );
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 200000 );
let light = new THREE.PointLight(0xffffff, 0.5);
light.position.y = 5000
scene.add( light );
scene.add( new THREE.AmbientLight(0xffffff, 0.5) );
camera.position.z = 15000;
let renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.autoclear = false;
let stats = new Stats();
document.body.append( stats.dom )
let listener = new THREE.AudioListener();
camera.add( listener );
let sound = new THREE.Audio( listener );
let audioLoader = new THREE.AudioLoader();
//let controls = new THREE.TrackballControls( camera );

//sad.mp3 touch.mp3 Fake.wav woah.mp3

audioLoader.load( 'music/woah.mp3', ( buffer ) => {
	sound.setBuffer( buffer );
	sound.setLoop(true);
	sound.setVolume(1);
  title.style.opacity = 1;
	playing = true;
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

document.addEventListener('keydown', ( e ) => {

	let evnt = window.event ? window.event : e;

	if ( evnt.keyCode == 87 ) {

		if ( up < tofroMax && !upint ) {
			upint = setInterval(() => {
				up = up + increments;
				let height = Math.floor( ( up / tofroMax ) * 50 );

				if ( height < 0 ) {
					acceleration.style.top = '50px';
					acceleration.style.bottom = '';
					acceleration.style.transform = 'rotate(180deg)';
					acceleration.style.height = ( height * -1 ) + 'px';
				} else {
					acceleration.style.top = '';
					acceleration.style.bottom = '50px';
					acceleration.style.transform = '';
					acceleration.style.height = height + 'px';
				}

				if ( up >= tofroMax ) {
					clearInterval( upint );
				}
			}, 10);
		}

	}

	if ( evnt.keyCode == 83 ) {
		if ( up > ( tofroMax * -1 ) && !downint ) {
			downint = setInterval(() => {
				up = up - increments;
				let max = tofroMax * -1;
				let height = Math.floor( ( up / tofroMax ) * 50 );

				if ( height < 0 ) {
					acceleration.style.top = '50px';
					acceleration.style.bottom = '';
					acceleration.style.transform = 'rotate(180deg)';
					acceleration.style.height = ( height * -1 ) + 'px';
				} else {
					acceleration.style.top = '';
					acceleration.style.bottom = '50px';
					acceleration.style.transform = '';
					acceleration.style.height = height + 'px';
				}

				if ( up <= max ) {
					clearInterval( downint );
					downint = false;
				}
			}, 10);
		}
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

	if ( evnt.keyCode == 87 ) {
		clearInterval( upint );
		upint = false;
	}

	if( evnt.keyCode == 83 ) {
		clearInterval( downint );
		downint = false;
	}

	if ( evnt.keyCode == 39 ) {
		left = 0;
	}

	if( evnt.keyCode == 37 ) {
		right = 0;
	}

});

document.addEventListener('mousemove', ( evnt ) => {
	let e = window.event ? window.event : evnt;

	let amountX = e.clientX / window.innerWidth;
	let amountY = e.clientY / window.innerHeight;
	camera.rotation.y = Math.PI * amountX * sensitivity * -1;
	camera.rotation.x = Math.PI * amountY * sensitivity;
});

let mx = 1.8;

let first = new LorenzAttractor({
	a: 512 * mx,
	b: 3072 * mx,
	c: 128 * mx,
	t: 0.00009,
	offset: { x: -80, y: 0, z: -100 },
	colors: [
		{ pct: 0, color: { r: 0x41, g: 0xf4, b: 0xc4 } },
		{ pct: 0.5, color: { r: 0x4e, g: 0x42, b: 0xf4 } },
	  { pct: 1, color: { r: 0xe5, g: 0x42, b: 0xf4 } }
	]
}, 50000);

let second = new HalvorsenAttractor({
	b: 0.208186,
	t: 1.5,
	scale: 30000,
	offset: {x: 0, y: 3000, z: 500},
	initial: {x: 1000, y: 222, z: 456},
	colors: [
		{ pct: 0, color: { r: 0xf4, g: 0xee, b: 0x42 } },
		{ pct: 0.5, color: { r: 0x41, g: 0xf4, b: 0x68 } },
  	{ pct: 1, color: { r: 0x41, g: 0xdf, b: 0xf4 } }
	]
}, 40000);

scene.add( first.fractal );
scene.add( second.fractal );

let AudioSpectrum = new AudioBars( analyser, 0.2 );
document.body.appendChild( AudioSpectrum.Dom );

let g = new THREE.CubeGeometry( 100, 100, 100 );
let m = new THREE.MeshNormalMaterial();
let box = new THREE.Mesh( g, m );
scene.add( box );

function animate () {
	camera.position.z -= up + down;
	camera.position.x += left + right;
  //controls.update();
	AudioSpectrum.update();
	box.rotation.x += 0.003;
	box.rotation.y += 0.003;
	let s = analyser.getAverageFrequency() / 100;
	if ( playing ) { box.scale.set( s, s, s ) };
	first.update();
	second.update();
  TWEEN.update();
	stats.update();
	renderer.render( scene, camera );
  requestAnimationFrame( animate );
};

window.addEventListener('resize', function () {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

animate();
