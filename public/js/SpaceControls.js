'use strict';

THREE.SpaceControls = function ( camera, options ) {

  //Set the initial velocity and x, y, z intervals

  let upint,
    downint,
	  leftint,
	  rightint,
    forwardint,
    backint,
    endTime,
    startTime = Date.now(),
    mouse_prev = { x: 0, y: 0 };

  this.velocity = {
    x: 0,
    y: 0,
    z: 0
  };
  this.camera = camera;
  this.camera.rotation.order = 'YXZ';

  //Set paramaters to class variables and set default values
  //Sensitivity, lookSensitivity, cb, and Acceleration

  if ( !options.Sensitivity ) {

    this.Sensitivity = 0.8;

  } else {

    this.Sensitivity = options.Sensitivity;

  }

  if ( !options.cb ) {

    this.cb = () => {};

  } else {

    this.cb = options.cb;

  }

  if ( !options.Acceleration ) {

    this.Acceleration = 0.001;

  } else {

    this.Acceleration = options.Acceleration;

  }

  if ( !options.maxSpeed ) {
    this.maxSpeed = 0.1;
  } else {
    this.maxSpeed = options.maxSpeed;
  }

  //Camera rotation algorithm on mouse movement

  document.addEventListener('mousemove', ( evnt ) => {

      let e = window.event ? window.event : evnt;

    	this.camera.rotation.x += ( ( mouse_prev.y - e.clientY ) * 0.01 ) * this.Sensitivity;
    	this.camera.rotation.y += ( ( mouse_prev.x - e.clientX ) * -0.01 ) * this.Sensitivity;

    	mouse_prev = {x: e.clientX, y: e.clientY};

  });



  document.addEventListener('keydown', ( e ) => {

  	let evnt = window.event ? window.event : e;

  	if ( evnt.keyCode == 70 ) {
  		//R

  		if ( this.velocity.y < this.maxSpeed && !upint ) {
        //
  			upint = setInterval(() => {
  				this.velocity.y += this.Acceleration;
          this.cb( this.velocity, startTime );
          this.update();

  				if ( this.velocity.y >= this.maxSpeed ) {
  					clearInterval( upint );
            upint = false;
            this.cb( this.velocity, startTime );
            this.update();
  				}
  			}, 10);
  		}

  	}

  	if ( evnt.keyCode == 82 ) {
  		//F
  		if ( this.velocity.y > ( this.maxSpeed * -1 ) && !downint ) {
  			downint = setInterval(() => {
  				this.velocity.y -= this.Acceleration;
  				let max = this.maxSpeed * -1;
          this.cb( this.velocity, startTime );
          this.update();

  				if ( this.velocity.y <= max ) {
  					clearInterval( downint );
  					downint = false;
            this.cb( this.velocity, startTime );
            this.update();
  				}
  			}, 10);
  		}
  	}

  	if ( evnt.keyCode == 87 ) {
  		//W
  		if ( this.velocity.z < this.maxSpeed && !forwardint ) {

  			forwardint = setInterval(() => {
  				this.velocity.z += this.Acceleration;
          this.cb( this.velocity, startTime );
          this.update();

  				if ( this.velocity.z >= this.maxSpeed ) {
  					clearInterval( forwardint );
  					forwardint = false;
            this.cb( this.velocity, startTime );
            this.update();
  				}
  			}, 10);

  		}
  	}

  	if( evnt.keyCode == 83 ) {
  		//S
  		if ( this.velocity.z >= ( this.maxSpeed * - 1 ) && !backint ) {

  			backint = setInterval(() => {
  				this.velocity.z -= this.Acceleration;
  				let max = this.maxSpeed * -1;
  				this.cb( this.velocity, startTime );
          this.update();

  				if ( this.velocity.z <= max ) {
  					clearInterval( backint );
  					backint = false;
            this.cb( this.velocity, startTime );
            this.update();
  				}
  			}, 10);

  		}
  	}

  	if ( evnt.keyCode == 68 ) {
  		//D
  		if ( this.velocity.x < this.maxSpeed && !rightint ) {

  			rightint = setInterval(() => {
  				this.velocity.x += this.Acceleration;
          this.cb( this.velocity, startTime );
          this.update();

  				if ( this.velocity.x >= this.maxSpeed ) {
  					clearInterval( rightint );
  					rightint = false;
            this.cb( this.velocity, startTime );
            this.update();
  				}
  			}, 10);

  		}
  	}

  	if( evnt.keyCode == 65 ) {
  		//A
  		if ( this.velocity.x >= ( this.maxSpeed * - 1 ) && !leftint ) {

  			leftint = setInterval(() => {
  				this.velocity.x -= this.Acceleration;
  				let max = this.maxSpeed * -1;

          this.cb( this.velocity, startTime );
          this.update();

  				if ( this.velocity.x <= max ) {
  					clearInterval( leftint );
  					leftint = false;
            this.cb( this.velocity, startTime );
            this.update();
  				}
  			}, 10);

  		}
  	}

  });

  document.addEventListener('keyup', ( e ) => {
  	let evnt = window.event ? window.event : e;

  	if ( evnt.keyCode == 70 ) {
  		//R
  		clearInterval( upint );
  		upint = false;
      this.cb( this.velocity, startTime );
      this.update();
  	}

  	if( evnt.keyCode == 82 ) {
  		//F
  		clearInterval( downint );
  		downint = false;
      this.cb( this.velocity, startTime );
      this.update();
  	}

  	if ( evnt.keyCode == 87 ) {
  		//W
  		clearInterval( forwardint );
  		forwardint = false;
      this.cb( this.velocity, startTime );
      this.update();
  	}

  	if( evnt.keyCode == 83 ) {
  		//S
  		clearInterval( backint );
  		backint = false;
      this.cb( this.velocity, startTime );
      this.update();
  	}

  	if( evnt.keyCode == 65 ) {
  		//A
  		clearInterval( leftint );
  		leftint = false;
      this.cb( this.velocity, startTime );
      this.update();
  	}

  	if( evnt.keyCode == 68 ) {
  		//D
  		clearInterval( rightint );
  		rightint = false;
      this.cb( this.velocity, startTime );
      this.update();
  	}

  });

  this.update = () => {

    let timeDifference = Date.now() - startTime;
    camera.position.x += timeDifference * this.velocity.x;
    camera.position.y += timeDifference * this.velocity.y;
    camera.position.z += timeDifference * this.velocity.z;
    startTime = Date.now();

  }

};
