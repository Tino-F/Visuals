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

let second = new HalvorsenAttractor({b: 0.208186, t: 1.5}, {x: 1000, y: 222, z: 456},
	{x: 0, y: 3000, z: 500},
	[
		{ pct: 0, color: { r: 0xf4, g: 0xee, b: 0x42 } },
		{ pct: 0.5, color: { r: 0x41, g: 0xf4, b: 0x68 } },
  	{ pct: 1, color: { r: 0x41, g: 0xdf, b: 0xf4 } }
	],
	30000,
	40000);

scene.add( first.fractal );
scene.add( second.fractal );

let AudioSpectrum = new AudioBars( analyser, 0.2 );
document.body.appendChild( AudioSpectrum.Dom );

let g = new THREE.CubeGeometry( 100, 100, 100 );
let m = new THREE.MeshNormalMaterial(/*{color: 0x290a5b}*/);
let box = new THREE.Mesh( g, m );
scene.add( box );

function animate () {
	camera.position.z -= up + down;
	camera.position.x += left + right;
  controls.update();
	AudioSpectrum.update();
	box.rotation.x += 0.003;
	box.rotation.y += 0.003;
	let s = analyser.getAverageFrequency() / 100;
	box.scale.set( s, s, s );
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
