const mat4 = glMatrix.mat4;
const toRadian = glMatrix.glMatrix.toRadian;

//animation variables
var angleUp=0;
var riseUp = 0;
var riseMaxHeight = 30.7;
var isRising = false;
var armRising = false;
var riseSpeed = 1.1;
var angleSpeed = 15;

var shift = 0; //shift coordinates of object models
var matStack = [];
var camera = [0,0,0];
var pressedKeys = {};
var requestId=0; //animation request ID

var uView = mat4.create();
var uProj = mat4.create();
var lightDirection = [-6,-5,-6];


var canvas = document.getElementById("master");
var mousePosition = {x:canvas.width/2,y:canvas.height/2};
var gl = initWebGL(canvas, {}, true);

const vertexShaderSource = document.getElementById('vertex-shader').text;
const fragmentShaderSource = document.getElementById('fragment-shader').text;
const vertexShader = initShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = initShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

var pointers = {};

function handleKeyDown(event) {
	pressedKeys[event.keyCode] = true;
}
function handleKeyUp(event) {
	pressedKeys[event.keyCode] = false;
}
function fnc(evt) {
	mousePosition = getMousePos(canvas, evt);
}
function  getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect(); // abs. size of element
		scaleX = canvas.width / rect.width;    // relationship bitmap vs. element for X
		scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y
	
	return {
		x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
		y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
	}
}
function handleKeys() {
	if(pressedKeys[87]){
		if(camera[1] <= 25)  camera[1]+=1.1;
	}
	if(pressedKeys[83]){
		if(camera[1] >= 15)  camera[1]-=1.1;
	}
	if(pressedKeys[65]){
		if(camera[0] >= -65) camera[0]-=1.1;
	}
	if(pressedKeys[68]){
		if(camera[0] <= 65)  camera[0]+=1.1;
	}
	cancelAnimationFrame(requestId);
}
var parts = [
	headInfo = {
		id		: 1,
		dims	: [160,160,160],
		transl	: [0+shift,.56,0],
		rot		: [0,0,0],
		arrs	: null,
		buffers	: null,
		uModel	: null,
		uNormal	: null,
	},
	bodyInfo = {
		id		: 2,
		dims	: [160,240,80],
		transl	: [0+shift,0,0],
		rot		: [0,0,0],
		arrs	: null,
		buffers	: null,
		uModel	: null,
		uNormal	: null,
	},
	armLeftInfo = {
		id		: 3,
		dims	: [60,240,60],
		transl	: [-.30+shift, 0, .1],
		rot		: [angleUp,0,0],
		arrs	: null,
		buffers	: null,
		uModel	: null,
		uNormal	: null,
	},
	armRightInfo = {
		id		: 4,
		dims	: [60,240,60],
		transl	: [.30+shift, 0, .1],
		rot		: [angleUp,0,0],
		arrs	: null,
		buffers	: null,
		uModel	: null,
		uNormal	: null,
	},
];
var pipe = [
	baseInfo = {
		id		: 1,
		dims	: [500,300,500],
		transl	: [0,0,0],
		rot		: [0,0,0],
		arrs	: null,
		buffers	: null,
		uModel	: null,
		uNormal	: null,
	},
	frontInfo = {
		id		: 2,
		dims	: [600,150,100],
		transl	: [0,0.5,0.75],
		rot		: [0,0,0],
		arrs	: null,
		buffers	: null,
		uModel	: null,
		uNormal	: null,
	},
	backInfo = {
		id		: 2,
		dims	: [600,150,-100],
		transl	: [0,0.5,-0.75],
		rot		: [0,0,0],
		arrs	: null,
		buffers	: null,
		uModel	: null,
		uNormal	: null,
	},
	leftInfo = {
		id		: 3,
		dims	: [100,-150,600],
		transl	: [-0.75,0.5,0],
		rot		: [0,0,0],
		arrs	: null,
		buffers	: null,
		uModel	: null,
		uNormal	: null,
	},
	rightInfo = {
		id		: 4,
		dims	: [-100,150,600],
		transl	: [0.75,0.5,0],
		rot		: [0,0,0],
		arrs	: null,
		buffers	: null,
		uModel	: null,
		uNormal	: null,
	},
];
var shadingProperties = {
	"light": {
			"ambient"   : [0.6,0.3,0.4],
			"diffuse"   : [1.0,1.0,1.0],
			"specular"  : [1.0,1.0,1.0],
			"direction" : [-6,-5,-6],
	},
	"material" : {
			"ambient"   : [0.0,0.5,0.0],
			"diffuse"   : [0.2,0.7,0.2],
			"specular"  : [0.9,1.0,0.9],
			"shininess" : 2.0,
	},
	"flags": {
			"ambient"   : true,
			"diffuse"   : true,
			"specular"  : true,
	},
};
var bgGround = {
	arrs : {
		vertices : [
			-5,-1.5,-5,
			 5,-1.5,-5,
			 5,-1.5, 5,
			-5,-1.5, 5,
			
			-5,-5,-1.5,
			-5, 5,-1.5,
			 5, 5,-1.5,
			 5,-5,-1.5,
		],
		normals : [
			-5,-1.5,-5,
			 5,-1.5,-5,
			 5,-1.5, 5,
			-5,-1.5, 5,

			-5,-5,-1.5,
			-5, 5,-1.5,
			 5, 5,-1.5,
			 5,-5,-1.5,
		],
		indices : [
			1,2,3, 1,3,4,
			5,6,7, 5,7,8,
		]
	},
	buffers	: null,
	uModel	: null,
	uNormal	: null,
}


function setGeom(w,h,d) {
	let arrs = {};
	arrs.vertices = [];
	arrs.normals  = [];
	arrs.indices  = [];
	var x = w/(canvas.width-canvas.height);
	var y = h/(canvas.width-canvas.height);
	var z = d/(canvas.width-canvas.height);
	arrs.vertices = [
		/* front */
		-x, -y,  z,
		 x, -y,  z,
		 x,  y,  z,
		-x,  y,  z,

		/* Back face */
		-x, -y, -z,
		-x,  y, -z,
		 x,  y, -z,
		 x, -y, -z,

		/* Top face */
		-x,  y, -z,
		-x,  y,  z,
		 x,  y,  z,
		 x,  y, -z,

		/* Bottom face */
		-x, -y, -z,
		 x, -y, -z,
		 x, -y,  z,
		-x, -y,  z,

		/* Right face */
		 x, -y, -z,
		 x,  y, -z,
		 x,  y,  z,
		 x, -y,  z,

		/* Left face */
		-x, -y, -z,
		-x, -y,  z,
		-x,  y,  z,
		-x,  y, -z,
	];
	arrs.normals = arrs.vertices;
	for(let i=0; i<arrs.vertices.length/3; i+=4){
		arrs.indices.push(i);
		arrs.indices.push(i+1);
		arrs.indices.push(i+2);
		arrs.indices.push(i);
		arrs.indices.push(i+2);
		arrs.indices.push(i+3);
	}
	return arrs;
}

function setBuffers(vertices, normals, indices) {
	var buffers = {};

	buffers.vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	buffers.vertexBuffer.itemSize = 3;
	buffers.vertexBuffer.numItems = vertices.length;

	buffers.indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	buffers.indexBuffer.itemSize = 1;
	buffers.indexBuffer.numItems = indices.length;

	buffers.normalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normalBuffer);

	return buffers;
}

function setPointers(program) {
	var ptrObj = {};
	ptrObj.aPositionPointer					 = gl.getAttribLocation(program, 'a_position');
	ptrObj.aNormalPointer						 = gl.getAttribLocation(program, 'a_normal');
	ptrObj.aPointSizePointer					 = gl.getAttribLocation(program, 'a_point_size');
	ptrObj.uModelMatrixPointer				 = gl.getUniformLocation(program, 'u_model_matrix');
	ptrObj.uViewMatrixPointer				 = gl.getUniformLocation(program, 'u_view_matrix');
	ptrObj.uProjectionMatrixPointer	 = gl.getUniformLocation(program, 'u_projection_matrix');
	ptrObj.uNormalMatrixPointer			 = gl.getUniformLocation(program, 'u_normal_matrix');
	ptrObj.uLightDirectionPointer		 = gl.getUniformLocation(program, 'u_light_direction');
	ptrObj.uEyePositionPointer				 = gl.getUniformLocation(program, 'u_eye_position');
	ptrObj.uLightAmbientPointer			 = gl.getUniformLocation(program, 'u_light_ambient');
	ptrObj.uLightDiffusePointer			 = gl.getUniformLocation(program, 'u_light_diffuse');
	ptrObj.uLightSpecularPointer			 = gl.getUniformLocation(program, 'u_light_specular');
	ptrObj.uMaterialAmbientPointer		 = gl.getUniformLocation(program, 'u_material_ambient');
	ptrObj.uMaterialDiffusePointer		 = gl.getUniformLocation(program, 'u_material_diffuse');
	ptrObj.uMaterialSpecularPointer	 = gl.getUniformLocation(program, 'u_material_specular');
	ptrObj.uMaterialShininessPointer	 = gl.getUniformLocation(program, 'u_shininess');
	ptrObj.uEnableAmbientPointer			 = gl.getUniformLocation(program, 'u_enable_ambient');
	ptrObj.uEnableDiffusePointer			 = gl.getUniformLocation(program, 'u_enable_diffuse');
	ptrObj.uEnableSpecularPointer		 = gl.getUniformLocation(program, 'u_enable_specular');

	return ptrObj;
}
function drawObject (shape, shadeProps, primitiveType=gl.TRIANGLES) {
	gl.enable(gl.DEPTH_TEST);
	
	gl.uniformMatrix4fv(pointers.uModelMatrixPointer, false,new Float32Array(shape.uModel));
	gl.uniformMatrix4fv(pointers.uViewMatrixPointer, false, new Float32Array(uView));
	gl.uniformMatrix4fv(pointers.uProjectionMatrixPointer, false, new Float32Array(uProj));
	gl.uniformMatrix4fv(pointers.uNormalMatrixPointer, false, new Float32Array(shape.uNormal))

	// set light parameters
	gl.uniform3fv(pointers.uLightAmbientPointer, shadeProps.light.ambient);
	gl.uniform3fv(pointers.uLightDiffusePointer, shadeProps.light.diffuse);
	gl.uniform3fv(pointers.uLightSpecularPointer, shadeProps.light.specular);
	gl.uniform3fv(pointers.uLightDirectionPointer, lightDirection);
	gl.uniform3fv(pointers.uEyePositionPointer, camera);

	// set material properties
	gl.uniform3fv(pointers.uMaterialAmbientPointer, shadeProps.material.ambient);
	gl.uniform3fv(pointers.uMaterialDiffusePointer, shadeProps.material.diffuse);
	gl.uniform3fv(pointers.uMaterialSpecularPointer, shadeProps.material.specular);
	gl.uniform1f(pointers.uMaterialShininessPointer, shadeProps.material.shininess);

	// set flags
	gl.uniform1i(pointers.uEnableAmbientPointer, shadeProps.flags.ambient);
	gl.uniform1i(pointers.uEnableDiffusePointer, shadeProps.flags.diffuse);
	gl.uniform1i(pointers.uEnableSpecularPointer, shadeProps.flags.specular);
	
	// bind vertices
	gl.bindBuffer(gl.ARRAY_BUFFER, shape.buffers.vertexBuffer);
	gl.vertexAttribPointer(pointers.aPositionPointer, 3, gl.FLOAT, false, 0, 0);
	gl.vertexAttribPointer(pointers.aNormalPointer, 3, gl.FLOAT, false, 0, 0);
	// bind indices
	gl.enableVertexAttribArray(pointers.aPositionPointer);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shape.buffers.indexBuffer);

	// draw triangles based on indices array
	gl.drawElements(primitiveType, shape.buffers.indexBuffer.numItems, gl.UNSIGNED_BYTE, 0)
}
function updateMousePosition() {
		if( canvas.width/2 - 25 < mousePosition.x < 25 + canvas.width/2)   lightDirection = [0,mousePosition.x/2,50];
		if( canvas.height/2 - 25 < mousePosition.y < 25 + canvas.height/2)  lightDirection = [-mousePosition.y/2,0,50];
		if( canvas.height/2 - 25 < mousePosition.y < 25 + canvas.height/2)  lightDirection = [mousePosition.y/2,0,50];
		if( canvas.width/2 - 25 < mousePosition.x < 25 + canvas.width/2)		 lightDirection = [0,-mousePosition.x/2,50];
}

function animate() {
	handleKeys();
	// updateMousePosition();
	
	uView = mat4.lookAt(uView, [Math.cos(camera[0] *.7), Math.sin(camera[1]*.7), 15,1.0], [0,0,0,1.0], [0,1.0,0,0])
	uProj = mat4.perspective(uProj, toRadian(30),canvas.width/canvas.height,1,100);


	gl.clearColor(0, 0, 0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	bgGround.uModel = mat4.create();
	bgGround.uNormal = mat4.create();


	mat4.invert(bgGround.uNormal,bgGround.uModel);
	mat4.transpose(bgGround.uNormal,bgGround.uNormal);

	drawObject(bgGround, shadingProperties);


	var pipeSpacing = 3;
	for(i=-1;i<2;i++){
		for(j=-1; j<2; j++){
			pipe.forEach(function(part) {
				part.uModel = mat4.create();
				part.uNormal = mat4.create();
		
				mat4.translate(part.uModel, part.uModel, [part.transl[0]+i*pipeSpacing,part.transl[1],part.transl[2]+j*pipeSpacing]);
		
				mat4.invert(part.uNormal,part.uModel);
				mat4.transpose(part.uNormal,part.uNormal);
		
				drawObject(part, shadingProperties);
		
			});
		}
	}
	
	parts.forEach(function(part) {
		part.uModel = mat4.create();
		part.uNormal = mat4.create();

		mat4.translate(part.uModel, part.uModel, [part.transl[0],part.transl[1]+(0.03*riseUp),part.transl[2]]);
			
		if(riseUp>(2*riseMaxHeight/3) && part.id == 3){
			mat4.translate(part.uModel, part.uModel, [0,.35,0,0]);
			glMatrix.mat4.rotateZ(part.uModel,part.uModel, toRadian(180-angleUp));
			mat4.translate(part.uModel, part.uModel, [0,part.transl[1]+.35,0,0]);
		}
		if(riseUp>(2*riseMaxHeight/3) && part.id == 4){
			mat4.translate(part.uModel, part.uModel, [0,.35,0,0]);
			glMatrix.mat4.rotateZ(part.uModel,part.uModel, toRadian(angleUp));
			mat4.translate(part.uModel, part.uModel, [0,part.transl[1]-.35,0,0]);
		}

		mat4.invert(part.uNormal,part.uModel);
		mat4.transpose(part.uNormal,part.uNormal);

		drawObject(part, shadingProperties);

	});
	

	if(riseUp>riseMaxHeight) {
		isRising = false;
		armRising = false;
	}
	if(riseUp<0) {
		isRising = true;
		armRising = true;
	}
	if(isRising) {
		riseUp = (riseUp + riseSpeed);
	} else {
		riseUp = (riseUp - riseSpeed);
	}
	if(riseUp<riseMaxHeight && riseUp>(3*(riseMaxHeight/5))){
		if(armRising && angleUp<165) {
			angleUp = (angleUp + angleSpeed);
		} else {
			angleUp = (angleUp - angleSpeed);
		}
	}
	
	requestAnimFrame(animate);
}

function main() {
	var program = initProgram(gl, vertexShader, fragmentShader);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

	gl.useProgram(program);

	pointers = setPointers(program);

	gl.enable(gl.DEPTH_TEST);
	
	gl.enableVertexAttribArray(pointers.aPositionPointer);
	gl.enableVertexAttribArray(pointers.aNormalPointer);

	bgGround.buffers = setBuffers(bgGround.arrs.vertices,bgGround.arrs.normals,bgGround.arrs.indices);	

	parts.forEach(function(part){
		part.arrs = setGeom(part.dims[0],part.dims[1],part.dims[2]);
		part.buffers = setBuffers(part.arrs.vertices,part.arrs.normals,part.arrs.indices);

		// part.uModel = mat4.create();
		// part.uNormal = mat4.create();
	});
	pipe.forEach(function(part){
		part.arrs = setGeom(part.dims[0], part.dims[1], part.dims[2]);
		part.buffers = setBuffers(part.arrs.vertices, part.arrs.normals, part.arrs.indices);
	
		// part.uModel	 = mat4.create();
		// part.uNormal	 = mat4.create();

	})

	animate();
	
	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;
}
main();