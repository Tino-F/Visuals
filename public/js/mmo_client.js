let server = io();
let users = {};
let user_array = [];
let JSONLoader = new THREE.JSONLoader();

function getTime () {
  let now = new Date();
  let now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getMilliseconds());
  return now_utc.getTime();
}

class Player {

  constructor ( playerData ) {

    console.log( 'New player', playerData );

    this.Username = playerData.Username;
    this.firstName = playerData.FirstName;
    this.lastName = playerData.LastName;
    this.Color = new THREE.Color( playerData.Color );
    this.Rotation = playerData.Rotation;
    this.StartTime = playerData.StartTime;
    this.Velocity = playerData.Velocity;
    this.position = playerData.position;
    this.Score = playerData.Score;

    /*
    this.g = new THREE.SphereBufferGeometry( 30, 30, 30 );
    this.m = new THREE.MeshNormalMaterial({color: this.Color });
    this.model = new THREE.Line( this.g, this.m );
    */

    JSONLoader.load('models/spaceships/1.json', ( g, material ) => {
      this.g = g;
      this.m = material;
      this.model = new THREE.Mesh( this.g, this.m );
      this.model.scale.set( 30, 30, 30 );
      this.model.position.x = this.position.x;
      this.model.position.y = this.position.y;
      this.model.position.z = this.position.z;
      scene.add( this.model );
    });

    this.update = () => {

      let timeDifference = getTime() - this.StartTime;
      //console.log( timeDifference, this.Velocity, this.model.position );

      if ( this.model ) {
        this.model.position.x += timeDifference * this.Velocity.x;
        this.model.position.y += timeDifference * this.Velocity.y;
        this.model.position.z += timeDifference * this.Velocity.z;
      }

      this.StartTime = getTime();

    }

  }

}

function move ( data ) {

  server.emit('move', data );

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
  users[ user.Username ].model.rotation.x = user.Rotation.x;
  users[ user.Username ].model.rotation.y = user.Rotation.y;
  users[ user.Username ].model.rotation.z = user.Rotation.z;
  users[ user.Username ].StartTime = getTime();
  users[ user.Username ].update();

});

server.on('new user', ( user ) => {

  users[ user.Username ] = new Player( user );
  user_array.push( users[ user.Username ] );

});

server.on('blank movement', () => {
  server.emit('move', {
    Velocity: controls.velocity,
    StartTime: controls.startTime,
    position: {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z
    },
    Rotation: {
      x: camera.rotation.x,
      y: camera.rotation.y,
      z: camera.rotation.z
    }
  });
});

server.on('playerlist', ( players ) => {
  players.forEach( ( player ) => {
    users[ player.Username ] = new Player( player );
    user_array.push( users[ player.Username ] );
  })
})

server.on('disconnect', ( userData ) => {

  scene.remove( users[ userData.Username ].model );
  delete users[ userData.Username ];
  let newUserArray = [];

  user_array.forEach( ( user ) => {
    if( user.Username == userData.Username ) {
      user_array.splice( user_array.indexOf( user ), 1 );
    }
  });

});

server.on('logout', () => {
  window.location = '/logout';
});

server.on('login', () => {
  window.location = '/login';
});
