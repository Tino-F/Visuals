let MongoClient = require('mongodb').MongoClient,
url = 'mongodb://localhost:27017/';

MongoClient.connect( url, ( err, db ) => {

  db.collection('Online').remove();

});

function User( socket ) {

  return socket.handshake.session.passport.user;

};

function addUser ( user, s ) {

  MongoClient.connect( url, ( err, db ) => {

    if ( !err ) {

      let online = db.collection('Online');
      online.find({Username: user.Username}).toArray(( err, data ) => {

        if ( data.length ) {

          s.emit('logout');
          db.close();

        } else {

          online.insert( user, ( err, r ) => {

            if ( !err ) {

              s.emit('added', { err: false });
              console.log( `${user.Username} has joined the server.`);
              db.close();

            } else {

              s.emit('added', { err: err });
              db.close();

            }

          });

        }

      });

    } else {

      console.log( err );
      s.emit('added', { err: 'Internal server error.' })
      db.close();

    }

  });

};

function removeUser ( s ) {

  let user = User( s );

  MongoClient.connect( url, ( err, db ) => {

    if ( !err ) {

      db.collection('Online').remove({Username: user.Username}, ( err, r ) => {

        if ( !err ) {

          console.log( `${user.Username} has left the server.`);
          db.close();

        }

      });

    } else {

      console.log( err );
      console.log( 'Failed to connect to server...' );
      s.emit('added', { err: 'Internal server error.' });

    }

  })

};

exports.init = ( io ) => {

  io.on( 'connection', s => {

    if ( !s.handshake.session.passport ) {

      s.emit('login');

    }

    s.on('ready', ( data ) => {
      let user = User( s );
      user.Rotation = data.Rotation;
      user.Velocity = data.Velocity;
      console.log( user );

      addUser( user, s );

    });

    s.on( 'disconnect', () => {

      removeUser( s );

    });

  });

};
