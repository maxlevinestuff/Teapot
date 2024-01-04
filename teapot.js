// some globals
var gl;

var delay = 100;

var vBuffer, nBuffer;

var program;
var vNormal, vPosition;

var M_PerspLoc;
var M_CameraLoc;

var lightPosLoc;
var ambientProductLoc;
var diffuseProductLoc;
var specularProductLoc;
var shininessLoc;

var teapot_geom;

// Your GL program starts after the HTML page is loaded, indicated
// by the onload event
window.onload = function init() {
	// get the canvas handle from the document's DOM
    var canvas = document.getElementById( "gl-canvas" );

	// generate hte teapot model
	teapot_geom = createTeapotGeometry(6);
	
	// console.log('Num teapot vertices, normals:' +
	// teapot_geom[0].length + ', ' + teapot_geom[1].length);
    
	// initialize webgl
	// gl = WebGLUtils.setupWebGL( canvas );
	gl = initWebGL(canvas)

	// check for errors
    if ( !gl ) { 
		alert( "WebGL isn't available" ); 
	}

    // specify viewing surface geometry to display your drawings
    gl.viewport(0, 0, canvas.width, canvas.height);

	// clear the display with a background color 
	// specified as R,G,B triplet in 0-1.0 range
    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );

    //  Initialize and load shaders -- all work done in init_shaders.js
    program = initShaders( gl, "vertex-shader", "fragment-shader" );

	// make this the current shader program
    gl.useProgram( program );

    gl.enable( gl.DEPTH_TEST)

    vPosition = gl.getAttribLocation( program, "vPosition");
    vNormal = gl.getAttribLocation( program, "vNormal");
    gl.enableVertexAttribArray(vNormal);
    gl.enableVertexAttribArray(vPosition);

    M_PerspLoc = gl.getUniformLocation( program, "projection" );
    M_CameraLoc = gl.getUniformLocation( program, "modelView" );

    lightPosLoc = gl.getUniformLocation( program, "lightPos" );
    ambientProductLoc = gl.getUniformLocation( program, "ambientProduct" );
    diffuseProductLoc = gl.getUniformLocation( program, "diffuseProduct" );
    specularProductLoc = gl.getUniformLocation( program, "specularProduct" );
    shininessLoc = gl.getUniformLocation( program, "shininess" );

	// create a vertex buffer - this will hold all vertices
    vBuffer = gl.createBuffer();
    nBuffer = gl.createBuffer();

	// transfer the data -- this is actually pretty inefficient!
	// flatten() function is defined in MV.js - this simply creates only
	// the vertex coordinate data array - all other metadata in Javascript
	// arrays should not be in the vertex buffer.

	//gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
	//gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));

	// bind the buffer, i.e. this becomes the current buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(teapot_geom[0]), gl.STATIC_DRAW);
	gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0); //number of elements per should be 3 but 4 displays

	gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(teapot_geom[1]), gl.STATIC_DRAW);
	gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0); //number of elements per should be 3 but 4 displays

    render();

	//alert(gl.getParameter(gl.VERSION));
};

function render() {
	// this is render loop

	// var lightPos = [-58., -60.,  100.0, 1.0];
	var lightAmbient = [0.2, 0.2, 0.2, 1.0];
	// var lightDiffuse = [0.7, 0.7, 0.7, 1.0];
	// var lightSpecular = [1., 1., 1., 1.0];
	var materialAmbient = [1.0, 1.0, 1.0, 1.0];
	// var materialDiffuse = [0.25, 0.36, 0.2, 1.0];
	// var materialSpecular = [0.8, 0.77, 0.77, 1.0];
	// var materialShininess = 4.0;

	var lightPos = [document.getElementById("light-x").value, document.getElementById("light-y").value, document.getElementById("light-z").value, 1.0];
	var diffuseIntensity = document.getElementById("diffuse-intensity").value;
	var lightDiffuse = [diffuseIntensity, diffuseIntensity, diffuseIntensity, 1.0];
	var specularIntensity = document.getElementById("specular-intensity").value;
	var lightSpecular = [specularIntensity, specularIntensity, specularIntensity, 1.0];
	var materialDiffuse = [document.getElementById("diffuse-red").value, document.getElementById("diffuse-green").value, document.getElementById("diffuse-blue").value, 1.0];
	var materialSpecular = [document.getElementById("specular-red").value, document.getElementById("specular-green").value, document.getElementById("specular-blue").value, 1.0];
	var materialShininess = document.getElementById("shininess").value;

	var ambientProduct = vecMult(lightAmbient, materialAmbient);
	var diffuseProduct = vecMult(lightDiffuse, materialDiffuse);
	var specularProduct = vecMult(lightSpecular, materialSpecular);

	gl.uniform4fv(lightPosLoc, lightPos);
	gl.uniform1f(shininessLoc, materialShininess);

	gl.uniform4fv(ambientProductLoc, ambientProduct);
	gl.uniform4fv(diffuseProductLoc, diffuseProduct);
	gl.uniform4fv(specularProductLoc, specularProduct);

	var width = .57;
	var height = .57;
	var near = 6;
	var far = 50;

	var left = -width/2;
	var right = width/2;

	var bottom = -height/2;
	var top = height/2;

	var LAT = normalize(vec3(1,-4.5,5));
	var UP = normalize(vec3(-1,9,-5));
	var U = cross_product(LAT, UP);
	var V = cross_product(U, LAT);
	var N = vec3(-LAT[0], -LAT[1], -LAT[2]);

	U = normalize(U)
	V = normalize(V)
	N = normalize(N)

	var rot = [
				[U[0], U[1], U[2], 0.0],
				[V[0], V[1], V[2], 0.0],
				[N[0], N[1], N[2], 0.0],
				[0.0, 0.0, 0.0, 1.0],
		   ];
	//rot.matrix = true

	//var rot = identity4();


	var trans = [
				[1.0, 0.0, 0.0, 1],
				[0.0, 1.0, 0.0, -4.5],
				[0.0, 0.0, 1.0, 5.0],
				[0.0, 0.0, 0.0, 1.0],
		   ];
	//trans.matrix = true

	//trans = transpose(trans)
	//rot = transpose(rot)

	//try use new mat_vec.js
	//try use simpler persp

	var MT = matMult(rot, trans);
	//MT.matrix = true;

	// var persp =	[
	// 	[(2 * near) / (right - left), 0, (right + left) / (right - left), 0],
	// 	[0, (2 * near) / (top - bottom), (top + bottom) / (top - bottom), 0],
	// 	[0, 0, -(far + near) / (far - near), -(2 * far * near) / (far - near)],
	// 	[0, 0, -1, 0],]
	var persp = [
		[near/right, 0, 0, 0],
		[0, near/top, 0, 0],
		[0,0,-(far+near)/(far-near),-(2*far*near)/(far-near)],
		[0,0,-1,0]
		]
	//persp.matrix = true

	persp = matMult(persp, identity4())
	persp = transpose(persp)
	//MT = transpose(MT)

	gl.uniformMatrix4fv(M_PerspLoc, false, flatten(persp));

	gl.uniformMatrix4fv(M_CameraLoc, false, flatten(MT));

	// clear the display with the background color
    gl.clear( gl.COLOR_BUFFER_BIT );

    gl.drawArrays(gl.TRIANGLES, 0, teapot_geom[0].length);

    setTimeout(
        function (){requestAnimFrame(render);}, delay
    );
}
