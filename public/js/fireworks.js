let	MaxSpeed = 4000,
	increments = 5,
	sensitivity = 20,
	upint,
	downint,
	leftint,
	rightint,
	forwardint,
	size = 15,
	backint;
let playing = false;
let title = document.getElementById('title');
let loading = document.getElementById('loading');
let progress = document.getElementById('progress');
let acceleration = document.getElementById('acceleration');
let scene = new THREE.Scene();
scene.background = new THREE.Color( 0x000000 );
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 200000 );
let light = new THREE.PointLight(0xffffff, 0.5);
light.position.y = 5000
scene.add( light );
scene.add( new THREE.AmbientLight(0xffffff, 0.5) );
camera.position.z = 0;
let renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio );
let stats = new Stats();
document.body.append( stats.dom )
let listener = new THREE.AudioListener();
camera.add( listener );
let sound = new THREE.Audio( listener );
let audioLoader = new THREE.AudioLoader();
let controls = new THREE.PointerLockControls( camera );
scene.add( controls.getObject() );
controls.enabled = true;
let velocity = {x: 0, y: 0, z: 0};

//sad.mp3 touch.mp3 Fake.wav woah.mp3

audioLoader.load( 'music/Fake.wav', ( buffer ) => {
	sound.setBuffer( buffer );
	sound.setLoop(true);
	sound.setVolume(1);
  title.style.opacity = 1;
	playing = true;
	server.emit('ready', {
		Velocity: {
			x: velocity.x,
			y: velocity.y,
			z: velocity.z
		},
		Rotation: {
			x: camera.rotation.x,
			y: camera.rotation.y,
			z: camera.rotation.z
		}
	});
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

let analyser = new THREE.AudioAnalyser( sound, 128 );
document.body.append( renderer.domElement );

function random ( min, max, sign ) {

  let rn = Math.floor((Math.random() * max) + min);

  if ( sign )
    rn *= Math.floor(Math.random()*2) == 1 ? 1 : -1;

  return rn;

};

function update_speed_bar () {
	let height = Math.floor( ( velocity.y / tofroMax ) * 50 );

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
};

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
	],
	pointSize: size,
	analyser: analyser
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
	],
	pointSize: size,
	analyser: analyser
}, 40000);

scene.add( first.fractal );
scene.add( second.fractal );

let AudioSpectrum = new AudioBars( analyser, 0.2 );
document.body.appendChild( AudioSpectrum.Dom );

let g = new THREE.CubeGeometry( 100, 100, 100 );
let m = new THREE.MeshNormalMaterial();
let box = new THREE.Mesh( g, m );
box.position.x = 500;
velocity.z = -20;
scene.add( box );

let prevTime = performance.now();

function animate () {
	AudioSpectrum.update();
	/*
	camera.position.x += velocity.x;
	camera.position.y += velocity.y;
	camera.position.z += velocity.z;
	*/
	let time = performance.now();
	let delta = ( time - prevTime ) / 1000;
	controls.getObject().translateX( velocity.x * delta );
	controls.getObject().translateY( velocity.y * delta );
	controls.getObject().translateZ( velocity.z * delta );
	prevTime = time;
	box.rotation.x += 0.003;
	box.rotation.y += 0.003;
	analyser.getFrequencyData();
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
