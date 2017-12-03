let MongoClient = require('mongodb').MongoClient,
onlineUsers = {},
online_user_array = [],
url = 'mongodb://localhost:27017/';

MongoClient.connect( url, ( err, db ) => {

  if ( !err ) {
    db.collection('Online').remove();
  } else {
    console.log( 'You forgot to start the database...' );
  }

});

class Player {

  constructor ( socket ) {

    this.s = socket;
    this.user = this.s.handshake.session.passport.user;
    this.Username = this.user.Username;
    this.userData = {
      FirstName: this.user.FirstName,
      LastName: this.user.LastName,
      Username: this.Username,
      Color: this.user.Color,
      StartTime: Date.now(),
      Velocity: {
        x: 0,
        y: 0,
        z: 0
      },
      position: {
        x: 0,
        y: 0,
        z: 0
      },
      Score: 0
    };

    this.ready = () => {

      MongoClient.connect( url, ( err, db ) => {

        if ( !err ) {

          let online = db.collection('Online');
          online.find({Username: this.Username}).toArray(( err, data ) => {
            if ( data.length ) {
              //the user is already logged in on a different device
              this.s.emit('logout');
              db.close();
            } else {
              online.insert( this.userData, ( err, r ) => {
                if ( !err ) {

                  this.s.broadcast.emit('new user', this.userData);

                  let allUserData = [];

                  online_user_array.forEach( ( user ) => {
                    allUserData.push( user.userData );
                  });

                  this.s.emit('playerlist', allUserData );

                  console.log( `${this.Username} has joined the server.`);
                  db.close();

                } else {

                  console.log( `Failed to add ${this.Username} to database.` );
                  db.close();

                }
              });
            }
          });
        } else {
          console.log( err );
          db.close();
        }

      });

    }

    this.remove = () => {

      this.s.broadcast.emit('disconnect', this.userData);

      MongoClient.connect( url, ( err, db ) => {
        if ( !err ) {
          db.collection('Online').remove({Username: this.Username}, ( err, r ) => {
            if ( !err ) {
              console.log( `${user.Username} has left the server.`);
              db.close();
            }
          });
        } else {
          console.log( err );
          console.log( 'Failed to connect to server...' );
        }

      });

    }

    this.move = ( data ) => {

      console.log( 'Player moved', data )

      if ( data ) {
        if ( !data.Velocity || !data.StartTime || !data.position || !data.Rotation ) {
          this.s.emit('blank movement');
        } else {
          this.s.broadcast.emit('player movement', this.userData);
          this.userData.Velocity = data.Velocity;
          this.userData.StartTime = data.StartTime;
          this.userData.position = data.position;
          this.userData.Rotation = data.Rotation;
        }
      }

    }

  }

}

let getUser = ( socket ) => {
  return socket.handshake.session.passport.user;
}

function getUsername ( socket ) {
  if( socket.handshake.session.passport[ 'user' ] )
    return socket.handshake.session.passport.user.Username;
}

exports.init = ( io ) => {

  io.on( 'connection', s => {

    let username;

    if ( !s.handshake.session.passport ) {
      //if user got logged out
      s.emit('login');
    }

    s.on('ready', ( data ) => {

      username = getUsername( s );
      onlineUsers[ username ] = new Player( s );
      onlineUsers[ username ].ready();
      online_user_array.push( onlineUsers[ username ] );

    });

    s.on('move', ( data ) => {

      console.log( data );

      onlineUsers[ username ].move( data );

    });

    s.on( 'disconnect', ( data ) => {

      if ( s.handshake.session.passport )
        onlineUsers[ username ].remove();

    });

  });

};
