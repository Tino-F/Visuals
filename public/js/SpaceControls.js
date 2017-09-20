'use strict';

THREE.SpaceControls = ( camera, sensitivity ) => {

  this.camera = camera;
  this.sensitivity = 1.8;

  document.addEventListener('mousemove', ( evnt ) => {
  	let e = window.event ? window.event : evnt;

  	let amountX = e.clientX / window.innerWidth;
  	let amountY = e.clientY / window.innerHeight;
    let rotationY = Math.PI * amountX * this.sensitivity * -1;
  	this.camera.rotation.y = rotationY;
    this.camera.rotation.x = Math.PI * amountY * this.sensitivity;

  });

};
