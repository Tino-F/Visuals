let crypto = require( 'crypto' ),
MongoClient = require('mongodb').MongoClient,
url = 'mongodb://localhost:27017/',
key = 'ayy lmaooooo';

exports.encrypt = ( text ) => {
  let cipher = crypto.createCipher( 'aes-256-ctr', key );
  let crypted = cipher.update( text, 'utf8', 'hex' );
  crypted += cipher.final( 'hex' );
  return crypted;
};

exports.decrypt = ( text ) => {
  let decipher = crypto.createDecipher( 'aes-256-ctr', key );
  let dec = decipher.update( text, 'utf8', 'hex' );
  dec += decipher.final( 'hex' );
  return dec;
};

exports.getUser = ( q, cb ) => {

  MongoClient.connect( url, ( err, db ) => {

    if ( !err ) {

      let Profiles = db.collection('Profiles');

      Profiles.find( q ).toArray( ( err, data ) => {

        if ( !err ) {

          cb( data );
          db.close();

        } else {

          cb( false );
          db.close();

        }

      });

    } else {

      cb( false );

    }

  });

};

exports.register = ( req, res ) => {
  /*
  {
    First Name
    Last Name
    Color
    Description
    Username
    Email
    EmailVerified
    Password
  }
  */

  if ( req.body.password1 != req.body.password2 ) {

    res.render( 'register', { err: 'Passwords do not match' } );

  } else {

    if ( !req.body.color || !req.body.description || !req.body.password1 || !req.body.password2 || !req.body.firstname || !req.body.lastname || !req.body.username || !req.body.email ) {

      res.render( 'register', { err: "Something's missing" } );

    } else {

      let color = req.body.color.replace(/#/, '0x');

      let user = {
        FirstName: req.body.firstname,
        LastName: req.body.lastname,
        Username: req.body.username,
        Color: color,
        Description: req.body.description,
        Email: req.body.email,
        Password: this.encrypt( req.body.password1 ),
        EmailVerified: false
      }

      MongoClient.connect( url, ( err, db ) => {
        if ( !err ) {

          let Profiles = db.collection('Profiles');

          Profiles.find( { Username: user.Username } ).toArray( ( err, item ) => {

            if ( !err ) {

              console.log( item );

              if ( item.length ) {
                //Another user was found with the same username

                res.render('register', { err: 'A user with that username already exists.' });
                db.close();

              } else {
                //This is a unique username

                Profiles.insert( user, ( err, r ) => {
                  if ( !err ) {

                    res.redirect('/login');
                    db.close();

                  } else {

                    res.render('register', { err: 'Sorry, something happened on our end. Wait a few minutes and try again later.' });
                    db.close();

                  }
                });

              }

            } else {

              res.render('register', { err: 'Sorry, something happened on our end. Wait a few minutes and try again later.' });
              db.close();

            }

          });

        } else {

          res.render('register', { err: 'Sorry, something happened on our end. Wait a few minutes and try again later.' });

        }
      });

    }

  }

};

exports.authenticate = ( username, password, done ) => {
  this.getUser({ Username: username }, ( user ) => {

    if ( user.length ) {

      if ( this.encrypt( password ) == user[0].Password ) {

        let cleanUser = user[0];
        cleanUser.Email = '';
        cleanUser.Password = '';
        done( false, cleanUser, false );

      } else {

        done( false, false, 'Incorrect password.' )

      }

    } else {

      let err = 'There is no user with username ' + username;
      done( false, false, err );

    }

  });
};
