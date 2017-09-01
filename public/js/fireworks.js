let sparks = [];
let blown = [];
let up = 0,
	down = 0,
	left = 0,
	right = 0;
let s_group = new THREE.Group();
let title = document.getElementById('title');
let loading = document.getElementById('loading');
let progress = document.getElementById('progress');
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000 );
camera.position.z = -1300;
let renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setClearColor( 0x000000 );
let controls = new THREE.TrackballControls( camera );
let listener = new THREE.AudioListener();
camera.add( listener );
let sound = new THREE.Audio( listener );
let audioLoader = new THREE.AudioLoader();

//sad.mp3 touch.mp3 Fake.wav

audioLoader.load( 'music/sad.mp3', ( buffer ) => {
	sound.setBuffer( buffer );
	sound.setLoop(true);
	sound.setVolume(1);
  title.style.opacity = 1;
  let fade_int = setInterval(() => {
		if ( title.style.opacity >= 0 ) {
			title.style.opacity -= 0.05;
		} else {
			nukeit();
			sound.play();
			title.remove();
			//setTimeout(() => {nukeit()}, 100);
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

function grab_lighter ( n ) {
	let m = new THREE.SpriteMaterial({color: 0xffffff});
	blown = [];

	for( let i = 0; i < n; i++ ) {
		let s = new THREE.Sprite( m );
		s.scale.set( 5, 5, 5 );
		s.position.set( 0, 0, 0 );
		sparks.push( s );
		s_group.add( s );
		blown.push({x: random( 0, window.innerWidth*2, true ), y: random( 0, window.innerHeight*2, true ), z: random( 0, 3000, true )});
	}

  scene.add( s_group );

};

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
	{ pct: 0, color: { r: 0x00, g: 0xff, b: 0xff } },
  { pct: 0.5, color: { r: 0x00, g: 0x00, b: 0xff } },
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

	/*
	if ( num > 10000 ) {
		num = 10000;
	}
	*/

	return get_color( num / 10000 );

};

function three_freq ( x ) {
	return get_color( analyser.getFrequencyData()[x] / 255 );
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

function animate () {
	camera.position.z += up + down + 0.1;
	camera.position.x += left + right;
  controls.update();
  TWEEN.update();
  s_group.children[0].material.color.setHex( three_freq(7) );
  console.log( analyser.getFrequencyData()[7] );
  renderer.render( scene, camera );
  requestAnimationFrame( animate );
};

renderer.domElement.onclick = () => {
  if ( nuked ) {
    unnukeit();
  } else {
    nukeit();
  }
};

window.addEventListener('resize', function () {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

grab_lighter(4000);
animate();
