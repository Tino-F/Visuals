'use strict';
let express = require('express'),
path = require('path'),
bodyParser = require('body-parser'),
cookieParser = require('cookie-parser'),
passport = require('passport'),
LocalStrat = require('passport-local').Strategy,
expresssession = require('express-session'),
socketsession = require('express-socket.io-session'),
port = 3000;
let app = express();

let session = expresssession({
  secret: 'fjdsklafjdklsajfithurznxzvczxn',
  resave: false,
  saveUninitialized: false
});

app.use( express.static( path.join( __dirname, 'public' ) ) );
app.use( cookieParser() );
app.use( bodyParser.urlencoded( { extended: false } ) );
app.use( session );
app.use( passport.initialize() );
app.use( passport.session() );
app.set('view engine', 'pug');

let backend = require('./backend.js');

passport.use( new LocalStrat( ( username, password, done ) => {
  backend.authenticate( username, password, done );
} ) );
passport.serializeUser( ( user, done ) => done( null, user ) );
passport.deserializeUser( ( user, done ) => done( null, user ) );

app.get('/login', ( req, res ) => {

  if ( req.isAuthenticated() ) {

    res.render('login', {err: `You are currently logged in as ${req.user.Username}.`});

  } else {

    res.render('login');

  }

});

app.post( '/login', ( req, res ) => {
  passport.authenticate( 'local', ( info, user, err ) => {
    if ( !err ) {
      req.logIn( user, ( err ) => {
        if ( !err ) {
          return res.redirect( '/' );
        } else {
          return res.render( 'login', { err: 'Internal server error.' } );
        }
      });
    } else {
      return res.render( 'login', { err: err } );
    }
  })( req, res );
} );

app.get('/logout', ( req, res ) => {

  req.logout();
  req.session.destroy();
  res.redirect('/login');

});

app.get('/', ( req, res ) => {

  if ( req.isAuthenticated() ) {

    res.render('home', { user: req.user });

  } else {

    res.redirect('/login');

  }

})

app.get('/register', ( req, res ) => {
  res.render('register');
})

app.post('/register', ( req, res ) => {
  backend.register( req, res )
})

app.listen(port, ( err ) => {
  if ( !err ) {
    console.log('Listening on:', port);
  } else {
    console.log( err );
  }
})
