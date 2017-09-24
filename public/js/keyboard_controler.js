document.addEventListener('keydown', ( e ) => {

	let evnt = window.event ? window.event : e;

	if ( evnt.keyCode == 82 ) {
		//R

		if ( velocity.y < MaxSpeed && !upint ) {
			upint = setInterval(() => {
				velocity.y += increments;

				if ( velocity.y >= MaxSpeed ) {
					clearInterval( upint );
				}
			}, 10);
		}

	}

	if ( evnt.keyCode == 70 ) {
		//F
		if ( velocity.y > ( MaxSpeed * -1 ) && !downint ) {
			downint = setInterval(() => {
				velocity.y -= increments;
				let max = MaxSpeed * -1;

				if ( velocity.y <= max ) {
					clearInterval( downint );
					downint = false;
				}
			}, 10);
		}
	}

	if ( evnt.keyCode == 83 ) {
		//W
		if ( velocity.z < MaxSpeed && !forwardint ) {

			forwardint = setInterval(() => {
				velocity.z += increments;

				if ( velocity.z >= MaxSpeed ) {
					clearInterval( forwardint );
					forwardint = false;
				}
			}, 10);

		}
	}

	if( evnt.keyCode == 87 ) {
		//S
		if ( velocity.z >= ( MaxSpeed * - 1 ) && !backint ) {

			backint = setInterval(() => {
				velocity.z -= increments;
				let max = MaxSpeed * -1;

				if ( velocity.z <= max ) {
					clearInterval( backint );
					backint = false;
				}
			}, 10);

		}
	}

	if ( evnt.keyCode == 68 ) {
		//D
		if ( velocity.x < MaxSpeed && !rightint ) {

			rightint = setInterval(() => {
				velocity.x += increments;

				if ( velocity.x >= MaxSpeed ) {
					clearInterval( rightint );
					rightint = false;
				}
			}, 10);

		}
	}

	if( evnt.keyCode == 65 ) {
		//A
		if ( velocity.x >= ( MaxSpeed * - 1 ) && !leftint ) {

			leftint = setInterval(() => {
				velocity.x -= increments;
				let max = MaxSpeed * -1;

				if ( velocity.x <= max ) {
					clearInterval( leftint );
					leftint = false;
				}
			}, 10);

		}
	}

});

document.addEventListener('keyup', ( e ) => {
	let evnt = window.event ? window.event : e;

	if ( evnt.keyCode == 82 ) {
		//R
		clearInterval( upint );
		upint = false;
	}

	if( evnt.keyCode == 70 ) {
		//F
		clearInterval( downint );
		downint = false;
	}

	if ( evnt.keyCode == 83 ) {
		//W
		clearInterval( forwardint );
		forwardint = false;
	}

	if( evnt.keyCode == 87 ) {
		//S
		clearInterval( backint );
		backint = false;
	}

	if( evnt.keyCode == 65 ) {
		//A
		clearInterval( leftint );
		leftint = false;
	}

	if( evnt.keyCode == 68 ) {
		//D
		clearInterval( rightint );
		rightint = false;
	}

});

//pointer lock
let locked = false;
renderer.domElement.requestPointerLocke = renderer.domElement.requestPointerLock || renderer.domElement.mozRequestPointerLock;

renderer.domElement.addEventListener('click', ( evnt ) => {
	if ( !locked ) {
		renderer.domElement.requestPointerLock();
	}
});
