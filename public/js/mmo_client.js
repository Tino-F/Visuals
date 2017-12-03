let server = io();
let users = {};
let user_array = [];

class Player {

  constructor ( playerData ) {

    this.Username = playerData.Username;
    this.firstName = playerData.FirstName;
    this.lastName = playerData.LastName;
    this.Color = new THREE.Color( playerData.Color );
    this.Rotation = playerData.Rotation;
    this.StartTime = playerData.StartTime;
    this.Velocity = playerData.Velocity;
    this.position = playerData.position;
    this.Score = playerData.Score;

    this.g = new THREE.SphereBufferGeometry( 30, 30, 30 );
    this.m = new THREE.MeshNormalMaterial({color: this.Color });
    this.model = new THREE.Line( this.g, this.m );
    this.model.position.x = this.position.x;
    this.model.position.y = this.position.y;
    this.model.position.z = this.position.z;
    scene.add( this.model );

    this.update = () => {

      let timeDifference = Date.now() - this.StartTime;
      console.log( timeDifference, this.Velocity );
      this.model.position.x += timeDifference * this.Velocity.x;
      this.model.position.y += timeDifference * this.Velocity.y;
      this.model.position.z += timeDifference * this.Velocity.z;

    }

  }

}

function move ( Velocity, StartTime, position, rotation ) {

  server.emit('move', {
    Velocity: Velocity,
    StartTime: StartTime,
    position: {
      x: position.x,
      y: position.y,
      z: position.z
    },
    Rotation: {
      x: rotation.x,
      y: rotation.y,
      z: rotation.z
    }
  });

};

function updatePlayers() {

  user_array.forEach(( user, index ) => {
    user.update();
  });

}

server.on('player movement', ( user ) => {

  users[ user.Username ].Velocity = user.Velocity;
  users[ user.Username ].StartTime = user.StartTime;
  users[ user.Username ].model.position.x = user.position.x;
  users[ user.Username ].model.position.y = user.position.y;
  users[ user.Username ].model.position.z = user.position.z;
  users[ user.Username ].model.rotation.set( user.Rotation );

});

server.on('new user', ( user ) => {

  users[ user.Username ] = new Player( user );
  user_array.push( users[ user.Username ] );

});

server.on('logout', () => {
  window.location = '/logout';
});

server.on('login', () => {
  window.location = '/login';
});
