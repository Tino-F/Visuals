'use strict';

//default vars

let defaultColor = [
  { pct: 0, color: { r: 0xf4, g: 0xee, b: 0x42 } },
  { pct: 0.5, color: { r: 0x41, g: 0xf4, b: 0x68 } },
  { pct: 1, color: { r: 0x41, g: 0xdf, b: 0xf4 } }
];
let defaultOffset = { x: 0, y: 0, z: 0 };

//decimal to hex function

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

//Fracal creates a group of points in 3D space which are graphed using whatever formula you give
//The formula is read as a function that returns a json object with vars x, y, and z.

class Fractal {
  color( pct ) {
    for (var i = 1; i < this.colors.length - 1; i++) {
        if (pct < this.colors[i].pct) {
            break;
        }
    }
    let lower = this.colors[i - 1];
    let upper = this.colors[i];
    let range = upper.pct - lower.pct;
    let rangePct = (pct - lower.pct) / range;
    let pctLower = 1 - rangePct;
    let pctUpper = rangePct;
    let color = {
        r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
        g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
        b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
    };
    return '0x' + componentToHex(color.r) + componentToHex(color.g) + componentToHex(color.b);
  }

  update () {
    let spectrum = this.analyser.getFrequencyData();
    let i = 0;

    this.point_materials.forEach(( point ) => {
      let color = this.color( spectrum[ i ] );
      point.color.setHex( color );
      i++;
    });

  }

  constructor ( formula, origin, analyser, colors, n ) {
    this.colors = colors;
    this.origin = {x: origin.x, y: origin.y, z: origin.z};
    this.point_shapes = [];
    this.pointArray = [];
    this.analyser = analyser;
    this.point_materials = [];
    this.mesh = new THREE.Group();
    this.nuked = false;
    let average = (n - (n % 16)) / 16;

    for ( let i = 0; i < 16; i++ ) {
      let shape = new THREE.Geometry();
      this.point_shapes[i] = shape ;
      this.point_materials[i] = new THREE.MeshPhongMaterial();
    }

    for (let i = 0; i < n; i++) {

      let coordinates = formula( i );
      this.pointArray.push( coordinates );
      let group;

      let point = new THREE.Vector3();
      point.x = coordinates.x + origin.x;
      point.y = coordinates.y + origin.y;
      point.z = coordinates.z + origin.z;

      if ( Math.floor( i / average )  > 15) {
        group = 15;
      } else {
        group = Math.floor( i / average );
      }

      this.point_shapes[ group ].vertices.push( point );

    }

    for ( let i = 0; i < this.point_shapes.length; i++ ) {
      let points = new THREE.Points( this.point_shapes[i], this.point_materials[i] );
      console.log( points );
      this.mesh.add( points );
    }

  }
};

//Generates a audio/color reactive Lorenz attractor based on vars a, b, c, and t

class LorenzAttractor {
	color( pct ) {
		for (var i = 1; i < this.colors.length - 1; i++) {
        if (pct < this.colors[i].pct) {
            break;
        }
    }
    let lower = this.colors[i - 1];
    let upper = this.colors[i];
    let range = upper.pct - lower.pct;
    let rangePct = (pct - lower.pct) / range;
    let pctLower = 1 - rangePct;
    let pctUpper = rangePct;
    let color = {
        r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
        g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
        b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
    };
    return '0x' + componentToHex(color.r) + componentToHex(color.g) + componentToHex(color.b);
	}

	draw () {
		let dx = (this.a * ( this.y - this.x )) * this.t;
		let dy = (this.x * ( this.b - this.z ) - this.y) * this.t;
		let dz = (this.x * this.y - this.c * this.z) * this.t;
		this.x = this.x + dx;
		this.y = this.y + dy;
		this.z = this.z + dz;
		return {x: this.x + this.origin.x, y: this.y + this.origin.y, z: this.z + this.origin.z};
	}

	update () {
		let spectrum = analyser.getFrequencyData();
    let i = 0;

    this.point_materials.forEach(( point ) => {
      let color = this.color( spectrum[i] / 255 );
      this.point_materials[i].color.setHex( color );
      i++;
    });
	}

	constructor ( options, n ) {
		//{a: 1, b: 1, c: 1, t: 1}
    if ( !options.offset ) {
      this.origin = { x: 0, y: 0, z: 0};
    } else {
      this.origin = defaultOffset;
    }

    if ( !options.colors ) {
      this.colors =  defaultColor;
    } else {
      this.colors = options.colors;
    }

		this.a = options.a;
		this.b = options.b;
		this.c = options.c;
		this.t = options.t;
		this.dt = options.t;
		this.x = 1;
		this.y = 1;
		this.z = 1;
    this.pointArray = [];
		this.point_shapes = [];
		this.point_materials = [];
		this.fractal = new THREE.Group();
		this.nuked = false;
		let average = (n - (n % 16)) / 16;

    for ( let i = 0; i < 16; i++ ) {
			let shape = new THREE.Geometry();
			this.point_shapes[i] = shape ;
			this.point_materials[i] = new THREE.PointsMaterial({color: 0xffffff});
		}

		for (let i = 0; i < n; i++) {

			let coordinates = this.draw();
      this.pointArray.push( coordinates );
			let group;

			let point = new THREE.Vector3();
			point.x = coordinates.x;
			point.y = coordinates.y;
			point.z = coordinates.z;

			if ( Math.floor( i / average )  > 15) {
				group = 15;
			} else {
				group = Math.floor( i / average );
			}

			this.point_shapes[ group ].vertices.push( point );

		}

    let i = 0;

    this.point_shapes.forEach(( point_geometry ) => {
      let cloud = new THREE.Points( point_geometry, this.point_materials[ i ] );
      this.fractal.add( cloud );
      i++;
    });

	}
};

class HalvorsenAttractor {
	color( pct ) {
		for (var i = 1; i < this.colors.length - 1; i++) {
        if (pct < this.colors[i].pct) {
            break;
        }
    }
    let lower = this.colors[i - 1];
    let upper = this.colors[i];
    let range = upper.pct - lower.pct;
    let rangePct = (pct - lower.pct) / range;
    let pctLower = 1 - rangePct;
    let pctUpper = rangePct;
    let color = {
        r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
        g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
        b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
    };
    return '0x' + componentToHex(color.r) + componentToHex(color.g) + componentToHex(color.b);
	}

	draw () {
		let dx = ( Math.sin( this.y ) - ( this.b * this.x ) ) * this.t;
		let dy = ( Math.sin( this.z ) - ( this.b * this.y ) ) * this.t;
		let dz = ( Math.sin( this.x ) - ( this.b * this.z ) ) * this.t;
		this.x = this.x + dx;
		this.y = this.y + dy;
		this.z = this.z + dz;
		return {x: (this.x * this.m) + this.placement.x, y: (this.y * this.m) + this.placement.y, z: (this.z * this.m) + this.placement.z};
	}

	update () {
		let spectrum = analyser.getFrequencyData();
    let i = 0;

    this.point_materials.forEach(( point ) => {
      let color = this.color( spectrum[ i ] / 255 );
      point.color.setHex( color );
      i++;
    });
	}

	constructor ( options, n ) {
    //{b: b < 1, t: 1}
    if ( !options.colors ) {
      this.colors = defaultColor;
    } else {
      this.colors = options.colors;
    }

    if ( !options.scale ) {
      this.m = 1000;
    } else {
      this.m = options.scale;
    }

    if ( !options.initial ) {
      this.x = 0;
  		this.y = 0;
  		this.z = 0;
    } else {
      this.x = options.initial.x;
  		this.y = options.initial.y;
  		this.z = options.initial.z;
    }

    if ( !options.offset ) {
      this.placement = { x: 0, y: 0, z: 0 };
    } else {
      this.placement = {x: options.offset.x, y: options.offset.y, z: options.offset.z};
    }

    this.b = options.b;
		this.t = options.t;
		this.point_shapes = [];
		this.point_materials = [];
    this.pointArray = [];
		this.fractal = new THREE.Group();
		this.nuked = false;
		let average = (n - (n % 16)) / 16;

		for ( let i = 0; i < 16; i++ ) {
			let shape = new THREE.Geometry();
			this.point_shapes[i] = shape ;
			this.point_materials[i] = new THREE.PointsMaterial({color: 0xffffff});
		}

		for (let i = 0; i < n; i++) {

			let coordinates = this.draw();
      this.pointArray.push( coordinates );
			let group;

			let point = new THREE.Vector3();
			point.x = coordinates.x;
			point.y = coordinates.y;
			point.z = coordinates.z;

			if ( Math.floor( i / average )  > 15) {
				group = 15;
			} else {
				group = Math.floor( i / average );
			}

			this.point_shapes[ group ].vertices.push( point );

		}

    let i = 0;

    this.point_shapes.forEach(( point_geometry ) => {
      let cloud = new THREE.Points( point_geometry, this.point_materials[ i ] );
      this.fractal.add( cloud );
      i++;
    });

	}
};

class AudioBars {

  update () {
    let spectrum = this.analyser.getFrequencyData();
    let i = 0;
    spectrum.forEach( ( sound ) => {
			let height = this.scale * sound;
      this.Bars[i].style.height = height + 'px';
      i++;
    });
  }

  constructor ( analyser, scale ) {

    this.analyser = analyser;
    this.Dom = document.createElement('div');
    this.Dom.classList.add('bar-container');
    this.Bars = [];
		this.scale = scale;

    for ( let i = 0; i < 16; i++ ) {
      let bar = document.createElement('div');
      bar.classList.add('bar');
      bar.style.width = '6.25%';
      this.Dom.appendChild( bar );
			this.Bars.push( bar );
    }

  }
}
