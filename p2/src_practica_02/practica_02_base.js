/*
* 
* Practica_02_base.js
* Videojuegos (30262) - Curso 2019-2020
* 
* Parte adaptada de: Alex Clarke, 2016, y Ed Angel, 2015.
* 
*/

// Variable to store the WebGL rendering context
var gl;

//----------------------------------------------------------------------------
// MODEL DATA 
//----------------------------------------------------------------------------

//Define points' position vectors
const cubeVerts = [
	[ 0.5, 0.5, 0.5, 1], //0
	[ 0.5, 0.5,-0.5, 1], //1
	[ 0.5,-0.5, 0.5, 1], //2
	[ 0.5,-0.5,-0.5, 1], //3
	[-0.5, 0.5, 0.5, 1], //4
	[-0.5, 0.5,-0.5, 1], //5
	[-0.5,-0.5, 0.5, 1], //6
	[-0.5,-0.5,-0.5, 1], //7
];

const wireCubeIndices = [
//Wire Cube - use LINE_STRIP, starts at 0, 30 vertices
	0,4,6,2,0, //front
	1,0,2,3,1, //right
	5,1,3,7,5, //back
	4,5,7,6,4, //right
	4,0,1,5,4, //top
	6,7,3,2,6, //bottom
];

const cubeIndices = [	
//Solid Cube - use TRIANGLES, starts at 0, 36 vertices
	0,4,6, //front
	0,6,2,
	1,0,2, //right
	1,2,3, 
	5,1,3, //back
	5,3,7,
	4,5,7, //left
	4,7,6,
	4,0,1, //top
	4,1,5,
	6,7,3, //bottom
	6,3,2,
];

const pointsAxes = [];
pointsAxes.push([ 2.0, 0.0, 0.0, 1.0]); //x axis is green
pointsAxes.push([-2.0, 0.0, 0.0, 1.0]);
pointsAxes.push([ 0.0, 2.0, 0.0, 1.0]); //y axis is red
pointsAxes.push([ 0.0,-2.0, 0.0, 1.0]); 
pointsAxes.push([ 0.0, 0.0, 2.0, 1.0]); //z axis is blue
pointsAxes.push([ 0.0, 0.0,-2.0, 1.0]);

const pointsWireCube = [];
for (let i=0; i < wireCubeIndices.length; i++)
{
	pointsWireCube.push(cubeVerts[wireCubeIndices[i]]);
}

const pointsCube = [];
for (let i=0; i < cubeIndices.length; i++)
{
	pointsCube.push(cubeVerts[cubeIndices[i]]);
}

const shapes = {
	wireCube: {Start: 0, Vertices: 30},
	cube: {Start: 0, Vertices: 36},
	axes: {Start: 0, Vertices: 6}
};
	
const red =			[1.0, 0.0, 0.0, 1.0];
const green =		[0.0, 1.0, 0.0, 1.0];
const blue =		[0.0, 0.0, 1.0, 1.0];
const lightred =	[1.0, 0.5, 0.5, 1.0];
const lightgreen =	[0.5, 1.0, 0.5, 1.0];
const lightblue = 	[0.5, 0.5, 1.0, 1.0];
const white =		[1.0, 1.0, 1.0, 1.0];

const colorsAxes = [
	green, green, //x
	red, red,     //y
	blue, blue,   //z
];	

const colorsWireCube = [
	white, white, white, white, white,
	white, white, white, white, white,
	white, white, white, white, white,
	white, white, white, white, white,
	white, white, white, white, white,
	white, white, white, white, white,
];

const colorsCube = [	
	lightblue, lightblue, lightblue, lightblue, lightblue, lightblue,
	lightgreen, lightgreen, lightgreen, lightgreen, lightgreen, lightgreen,
	lightred, lightred, lightred, lightred, lightred, lightred,
	blue, blue, blue, blue, blue, blue,
	red, red, red, red, red, red,
	green, green, green, green, green, green,
];

const nCubes = 20;

const cubeTraslation = [];
for(var i=0; i<nCubes; i++){
	let a = Math.floor(Math.random() * (6 - 0.1)) + 0.1;
	let b = Math.floor(Math.random() * (6 - 0.1)) + 0.1;
	let c = Math.floor(Math.random() * (6 - 0.1)) + 0.1;

	if (i %2 == 0) a *= -1;
	if (i %3 == 0) b *= -1;
	if (i %5 == 0) c *= -1;

	cubeTraslation[i] = [a, b, c];
}

const cubeRotAngle = [];
for(var i=0; i<nCubes; i++){
	cubeRotAngle[i] = 0.0;
}

const cubeRotChange = [];
for(var i=0; i<nCubes; i++){
	let num = Math.floor(Math.random() * (1.0 - 0.4)) + 0.4;
	if (i%2 == 0) num *= -1;

	cubeRotChange[i] = num;
}

//----------------------------------------------------------------------------
// OTHER DATA 
//----------------------------------------------------------------------------
var width, height;

var fov = 45.0;										//value of the fov for the pespective camera

var model = new mat4();   		// create a model matrix and set it to the identity matrix
var view = new mat4();   		// create a view matrix and set it to the identity matrix
var projection = new mat4();	// create a projection matrix and set it to the identity matrix

var eye, target, up;			// for view matrix

var rotAngle = 0.0;
var rotChange = 0.6;

var program;
var uLocations = {};
var aLocations = {};

var programInfo = {
			program,
			uniformLocations: {},
			attribLocations: {},
};

var objectsToDraw = [
		{
			// Ejes de coordenadas
		  programInfo: programInfo,
		  pointsArray: pointsAxes, 
		  colorsArray: colorsAxes, 
		  uniforms: {
			u_colorMult: [1.0, 1.0, 1.0, 1.0],
			u_model: new mat4(),
		  },
		  primType: "lines",
		  // Se puede anyadir cualquier otra informacion que se considere necesaria.
		},
		{
			// Cubo delineado blanco 
		  programInfo: programInfo,
		  pointsArray: pointsWireCube,
		  colorsArray: colorsWireCube, 
		  uniforms: {
			u_colorMult: [1.0, 1.0, 1.0, 1.0],
			u_model: new mat4(),
		  },
		  primType: "line_strip",
		},
		// CUBOS INICIALES
		{
		  programInfo: programInfo,
		  pointsArray: pointsCube, 
		  colorsArray: colorsCube, 
		  uniforms: {
			u_colorMult: [1.0, 1.0, 1.0, 1.0],
			u_model: new mat4(),
		  },
		  primType: "triangles",
		},		
		{
		  programInfo: programInfo,
		  pointsArray: pointsCube, 
		  colorsArray: colorsCube, 
		  uniforms: {
			u_colorMult: [0.5, 0.5, 0.5, 1.0],
			u_model: new mat4(),
		  },
		  primType: "triangles",
		},
];

// Los 20 cubos
for(var j=0; j<nCubes; j++){
	var i = j+4;
	objectsToDraw[i] = {
		programInfo: programInfo,
		pointsArray: pointsCube, 
		colorsArray: [	
[i/nCubes, 1.0 - i/nCubes, i/nCubes, 1.0], [i/nCubes, 1.0 - i/nCubes, i/nCubes, 1.0], [i/nCubes, 1.0 - i/nCubes, i/nCubes, 1.0], [i/nCubes, 1.0 - i/nCubes, i/nCubes, 1.0], [i/nCubes, 1.0 - i/nCubes, i/nCubes, 1.0], [i/nCubes, 1.0 - i/nCubes, i/nCubes, 1.0],
[i/nCubes, 1.0 - i/nCubes, i/nCubes, 1.0], [i/nCubes, 1.0 - i/nCubes, i/nCubes, 1.0], [i/nCubes, 1.0 - i/nCubes, i/nCubes, 1.0], [i/nCubes, 1.0 - i/nCubes, i/nCubes, 1.0], [i/nCubes, 1.0 - i/nCubes, i/nCubes, 1.0], [i/nCubes, 1.0 - i/nCubes, i/nCubes, 1.0],
[i/nCubes, 1.0 - i/nCubes, i/nCubes, 1.0], [i/nCubes, 1.0 - i/nCubes, i/nCubes, 1.0], [i/nCubes, 1.0 - i/nCubes, i/nCubes, 1.0], [i/nCubes, 1.0 - i/nCubes, i/nCubes, 1.0], [i/nCubes, 1.0 - i/nCubes, i/nCubes, 1.0], [i/nCubes, 1.0 - i/nCubes, i/nCubes, 1.0],
[i/nCubes, 1.0 - i/nCubes, i/nCubes, 1.0], [i/nCubes, 1.0 - i/nCubes, i/nCubes, 1.0], [i/nCubes, 1.0 - i/nCubes, i/nCubes, 1.0], [i/nCubes, 1.0 - i/nCubes, i/nCubes, 1.0], [i/nCubes, 1.0 - i/nCubes, i/nCubes, 1.0], [i/nCubes, 1.0 - i/nCubes, i/nCubes, 1.0],
[i/nCubes, 1.0 - i/nCubes, i/nCubes, 1.0], [i/nCubes, 1.0 - i/nCubes, i/nCubes, 1.0], [i/nCubes, 1.0 - i/nCubes, i/nCubes, 1.0], [i/nCubes, 1.0 - i/nCubes, i/nCubes, 1.0], [i/nCubes, 1.0 - i/nCubes, i/nCubes, 1.0], [i/nCubes, 1.0 - i/nCubes, i/nCubes, 1.0],
[i/nCubes, 1.0 - i/nCubes, i/nCubes, 1.0], [i/nCubes, 1.0 - i/nCubes, i/nCubes, 1.0], [i/nCubes, 1.0 - i/nCubes, i/nCubes, 1.0], [i/nCubes, 1.0 - i/nCubes, i/nCubes, 1.0], [i/nCubes, 1.0 - i/nCubes, i/nCubes, 1.0], [i/nCubes, 1.0 - i/nCubes, i/nCubes, 1.0],
],
		uniforms: {
		  u_colorMult: [1.0, 1.0, 1.0, 1.0],
		  u_model: new mat4(),
		},
		primType: "triangles",
	  };
}

//----------------------------------------------------------------------------
// Initialization function
//----------------------------------------------------------------------------

window.onload = function init() {
	
	// Set up a WebGL Rendering Context in an HTML5 Canvas
	var canvas = document.getElementById("gl-canvas");
	width = canvas.width, height = canvas.height;
	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) {
		alert("WebGL isn't available");
	}

	//  Configure WebGL
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	setPrimitive(objectsToDraw);

	// Set up a WebGL program
	// Load shaders and initialize attribute buffers
	program = initShaders(gl, "vertex-shader", "fragment-shader");
	  
	// Save the attribute and uniform locations
	uLocations.model = gl.getUniformLocation(program, "model");
	uLocations.view = gl.getUniformLocation(program, "view");
	uLocations.projection = gl.getUniformLocation(program, "projection");
	uLocations.colorMult = gl.getUniformLocation(program, "colorMult");
	aLocations.vPosition = gl.getAttribLocation(program, "vPosition");
	aLocations.vColor = gl.getAttribLocation(program, "vColor");

	programInfo.uniformLocations = uLocations;
	programInfo.attribLocations = aLocations;
	programInfo.program = program;

	gl.useProgram(programInfo.program);
	
	// Set up viewport 
	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

	// Set up camera
	// Projection matrix
	// Se crean las matrices de proyección y de la vista iniciales
	projection = perspective( fov, canvas.width/canvas.height, 0.1, 100.0 );

	gl.uniformMatrix4fv( programInfo.uniformLocations.projection, gl.FALSE, projection ); // copy projection to uniform value in shader
    // View matrix (static cam)
	eye = vec3(-5.0, 5.0, 16.0);
	target =  vec3(0.0, 0.0, 0.0);
	up =  vec3(0.0, 1.0, 0.0);
	view = lookAt(eye,target,up);
	gl.uniformMatrix4fv(programInfo.uniformLocations.view, gl.FALSE, view); // copy view to uniform value in shader
	
	requestAnimFrame(render);
	
};

//----------------------------------------------------------------------------
// Manejo de interacciones
//----------------------------------------------------------------------------

// Teclas
window.addEventListener('keydown', function(event) {
	var matrix;
	let x = 0, z = 0;
	switch(event.code){
		case 'ArrowUp':
			//nos acercamos
			console.log("Up pressed");
			z = -0.3;
			break;
		
		case 'ArrowDown':
			//nos alejamos
			console.log("Down pressed");
			z = 0.3;
			break;

		case 'ArrowRight':
			//movimiento lateral a derecha
			console.log("Right pressed");
			x = 0.3;
			break;

		case 'ArrowLeft':
			//movimiento lateral a izquierda
			console.log("Left pressed");
			x = -0.3;
			break;

		case 'KeyP':
			console.log("P pressed");
			//cambiar camara a perspectiva
			projection = perspective( fov, width/height, 0.1, 100.0 );

			gl.uniformMatrix4fv( programInfo.uniformLocations.projection, gl.FALSE, projection ); // copy projection to uniform value in shader
			break;

		case 'KeyO':
			console.log("O pressed");
			//cambiar camara a ortografica
			var left = -16;
			var right = 16;
			var bottom = -8;
			var top = 8;
			var near = 0.1;
			var far = 100.0;

			projection = ortho( left, right, bottom, top, near, far );
			
    		gl.uniformMatrix4fv( programInfo.uniformLocations.projection, gl.FALSE, projection ); // copy projection to uniform value in shader
			break;

		case 'NumpadAdd':
		case 'BracketRight':
			console.log("+ pressed");
			//más FOV en la camara perspectiva
			if ( fov < 90 ) {
				console.log(" entered ");
				fov = fov + 1;
			}
			projection = perspective( fov, width/height, 0.1, 100.0 );
    		
			gl.uniformMatrix4fv( programInfo.uniformLocations.projection, gl.FALSE, projection ); // copy projection to uniform value in shader	
			break;

		case 'NumpadSubtract':
		case 'Slash':
			console.log("- pressed");
			//menos FOV en la camara perspectiva
			if ( fov > -90 ) {
				console.log(" entered ");
				fov = fov - 1;
			}
			projection = perspective( fov, width/height, 0.1, 100.0 );
    		
			gl.uniformMatrix4fv( programInfo.uniformLocations.projection, gl.FALSE, projection ); // copy projection to uniform value in shader
			break;
	}

	// Set up camera
	view = mult(inverse4(translate(x, 0, z)), view);
	gl.uniformMatrix4fv(programInfo.uniformLocations.view, gl.FALSE, view);
});

// Raton
var isClicked = false;
var center;
var aux_view;
var pitch, yaw;

window.addEventListener('mousedown', function(event) {
	if(event.button == 0){
		console.log("Mouse down");
		isClicked = true;

		pitch = 0.0, yaw = 0.0;
		center = [event.clientX, event.clientY];
	}
});

window.addEventListener('mouseup', function(event) {
	if(event.button == 0){
		console.log("Mouse up");
		isClicked = false;

		// Una vez finalizada la rotacion de la camara, se actualiza la nueva view
		view = aux_view; 
	}
});

// INFO: La posicion (0, 0) del raton es la esquina izquierda de la ventana
// [IMP] Rango pitch y yaw +/-90°
window.addEventListener('mousemove', function(event) {

	// Solo se tiene en cuenta si el movimiento se produce dentro del grafico
	if(isClicked && event.clientX <= width && event.clientY <= height){
		let angRot = 0.5; // Incremento o decremento entre cada rotacion

		// Rotacion eje X
		if(event.clientY > center[1] && yaw <= 90){
			center[1] = event.clientY;
			yaw += angRot;

		} else if(event.clientY < center[1] && yaw >= -90) {
			center[1] = event.clientY;
			yaw -= angRot;
		}

		// Rotacion eje Y
		if(event.clientX > center[0] && pitch <= 90){
			center[0] = event.clientX;
			pitch += angRot;

		} else if(event.clientX < center[0] && pitch >= -90) {
			center[0] = event.clientX;
			pitch -= angRot;
		}		
		
		let rotX = rotate(yaw, vec3(1.0, 0.0, 0.0));
		let rotY = rotate(pitch, vec3(0.0, 1.0, 0.0));
		let rot = mult(rotY, rotX); // Intrinseca
		aux_view = mult(rot, view); // No actualizamos la view original
		
		gl.uniformMatrix4fv(programInfo.uniformLocations.view, gl.FALSE, aux_view);
	}
});

//----------------------------------------------------------------------------
// Rendering Event Function
//----------------------------------------------------------------------------

function render() {

	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
	
	//----------------------------------------------------------------------------
	// MOVE STUFF AROUND
	//----------------------------------------------------------------------------	

	// se actualiza su posición cambiando su matriz del modelo. También se podría aquí, por ejemplo, actualizar la cámara, cambiando la matriz de la vista, o la de proyección.

	let ejeY = vec3(0.0, 1.0, 0.0);
	let R = rotate(rotAngle, ejeY);	

	// Cubo que gira sobre si mismo
	let T = translate(1.0, 1.0, 3.0);
	objectsToDraw[2].uniforms.u_model = mult(T, R);
	
	// Cubo que gira entorno al eje de coordenadas
	T = translate(1.0, 0.0, 3.0);
	objectsToDraw[3].uniforms.u_model = mult(R, T);

	// Generacion de los nCubes
	for(var j=0; j<nCubes; j++){
		var i = j+4;
		// TransformedV = TranslationMatrix*RotationMatrix*ScaleMatrix*OriginalV
		R = rotate(cubeRotAngle[j], vec3(i%2, i%3, i%5));
		T = translate(cubeTraslation[j][0], cubeTraslation[j][1], cubeTraslation[j][2]);
		
		objectsToDraw[i].uniforms.u_model = mult(T, R);
		// Ademas de realizar primero la rotacion y traslacion, es necesario
		// rotarlo de nuevo para hacer que gire sobre el eje de coordenadas
		objectsToDraw[i].uniforms.u_model = mult(R, objectsToDraw[i].uniforms.u_model);

		cubeRotAngle[j] += cubeRotChange[j];
	}
	
	//----------------------------------------------------------------------------
	// DRAW
	//----------------------------------------------------------------------------

	objectsToDraw.forEach(function(object) {
		// no es necesario editar ninguna de las siguientes funciones para esta práctica
		gl.useProgram(object.programInfo.program); // establece los shaders a utilizar

		// Setup buffers and attributes, pasa la información del objeto
		setBuffersAndAttributes(object.programInfo, object.pointsArray, object.colorsArray);

		// Set the uniforms, pasa los uniforms a los shaders
		setUniforms(object.programInfo, object.uniforms);

		// Draw
		gl.drawArrays(object.primitive, 0, object.pointsArray.length);
    });	
    
	rotAngle += rotChange;
	
	requestAnimationFrame(render);	
}

//----------------------------------------------------------------------------
// Utils functions
//----------------------------------------------------------------------------

function setPrimitive(objectsToDraw) {	
	
	objectsToDraw.forEach(function(object) {
		switch(object.primType) {
		  case "lines":
			object.primitive = gl.LINES;
			break;
		  case "line_strip":
			object.primitive = gl.LINE_STRIP;
			break;
		  case "triangles":
		    object.primitive = gl.TRIANGLES;
		    break;
		  default:
			object.primitive = gl.TRIANGLES;
		}
	});	
}	

function setUniforms(pInfo, uniforms) {
	// Copy uniform model values to corresponding values in shaders
	gl.uniform4f(pInfo.uniformLocations.colorMult, uniforms.u_colorMult[0], uniforms.u_colorMult[1], uniforms.u_colorMult[2], uniforms.u_colorMult[3]);
	gl.uniformMatrix4fv(pInfo.uniformLocations.model, gl.FALSE, uniforms.u_model);
}

function setBuffersAndAttributes(pInfo, ptsArray, colArray) {
	// Load the data into GPU data buffers
	// Vertices
	var vertexBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
	gl.bufferData( gl.ARRAY_BUFFER,  flatten(ptsArray), gl.STATIC_DRAW );
	gl.vertexAttribPointer( pInfo.attribLocations.vPosition, 4, gl.FLOAT, gl.FALSE, 0, 0 );
	gl.enableVertexAttribArray( pInfo.attribLocations.vPosition );

	// Colors
	var colorBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, colorBuffer );
	gl.bufferData( gl.ARRAY_BUFFER,  flatten(colArray), gl.STATIC_DRAW );
	gl.vertexAttribPointer( pInfo.attribLocations.vColor, 4, gl.FLOAT, gl.FALSE, 0, 0 );
	gl.enableVertexAttribArray( pInfo.attribLocations.vColor );
}
