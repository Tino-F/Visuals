let server = io();
let users = {};

function move() {

  let v = controls.getObject();

  server.emit('move', {
    Velocity: {
			x: velocity.x,
			y: velocity.y,
			z: velocity.z
		}
  });

};

server.on('new user', ( user ) => {

  let g = new THREE.SphereBufferGeometry( 100, 100, 100 );
  let m = new THREE.MeshNormalMaterial({color: user.Color});
  let shape = new Three.Line( g, m );

});

server.on('logout', () => {
  window.location = '/logout';
});

server.on('login', () => {
  window.location = '/login';
});
