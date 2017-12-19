let size = 15;
let playing = false;
let effect = false;
let title = document.getElementById('title');
let vr_choice = document.getElementById('vr');
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
let sound = new THREE.PositionalAudio( listener );
let audioLoader = new THREE.AudioLoader();
let velocity = {x: 0, y: 0, z: 0};

//sad.mp3 touch.mp3 Fake.wav woah.mp3

audioLoader.load( 'music/sad.mp3', ( buffer ) => {
	//initial audio load function
	sound.setBuffer( buffer );
	sound.setLoop(true);
	sound.setRefDistance( 500 );
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

  title.remove();

}, ( xhr ) => {
	//load progress function
	let perc = (xhr.loaded / xhr.total * 100);
	let loaded = 'Loading: ' + Math.floor(perc) + '%';
	progress.style.width = ( (perc * 10) / 10 ) + '%';
	loading.innerHTML = loaded;

}, ( err ) => {
	//Error function
	loading.innerHTML = '<span style="color: red;">An error has occured.</span>';

});

function load_song ( url ) {

	audioLoader.load( url, ( buffer ) => {
		//initial audio load function
		sound.setBuffer( buffer );
		sound.setLoop(true);
		sound.setRefDistance( 500 );
		sound.setVolume(1);
	  title.style.opacity = 1;
		sound.stop();
		sound.play();
		playing = true;

	}, ( xhr ) => {
		//load progress function
		let perc = (xhr.loaded / xhr.total * 100);
		let loaded = 'Loading ' + url + ': ' + Math.floor(perc) + '%';
		console.log( loaded )

	}, ( err ) => {
		//Error function

		console.log( 'Failed to load: ' + url );
		console.log( err )

	});

}

let analyser = new THREE.AudioAnalyser( sound, 128 );

document.body.append( renderer.domElement );

function select_vr( bool ) {

	if( bool ) {
		//VR turned on

		effect = new THREE.StereoEffect( renderer );
		effect.setSize( window.innerWidth, window.innerHeight );

	}

	vr_choice.style.opacity = 1;

	let fade_int = setInterval(() => {
		if ( vr_choice.style.opacity >= 0 ) {
			vr_choice.style.opacity -= 0.05;
		} else {
			vr_choice.remove();
			clearInterval( fade_int );
			sound.play();
		}
	}, 10);

}

function random ( min, max, sign ) {
  let rn = Math.floor((Math.random() * max) + min);
  if ( sign )
    rn *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
  return rn;
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
box.add( sound );
box.position.x = 500;
velocity.z = -20;
scene.add( box );

let controls = new THREE.SpaceControls( camera, {cb: move} );


function animate () {
	AudioSpectrum.update();
	controls.update();
	first.update();
	second.update();
  TWEEN.update();
	stats.update();
	updatePlayers();
	box.rotation.x += 0.003;
	box.rotation.y += 0.003;
	analyser.getFrequencyData();
	let s = analyser.getAverageFrequency() / 100;
	if ( playing ) { box.scale.set( s, s, s ) };
	if ( !effect ) {
		renderer.render( scene, camera );
	} else {
		effect.render( scene, camera );
	}
  requestAnimationFrame( animate );
};

window.addEventListener('resize', function () {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

animate();
