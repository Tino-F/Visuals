'use strict';
let express = require('express'),
path = require('path'),
port = 3000;
let app = express();

app.set('view engine', 'pug');
app.use( express.static( path.join( __dirname, 'public' ) ) );

app.get('/', ( req, res ) => {
  res.render('home');
});

app.listen(port, ( err ) => {
  if ( !err ) {
    console.log('Listening on:', port);
  } else {
    console.log( err );
  }
})
