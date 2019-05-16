function main() {
  const hammerCanvas = document.getElementById("hammer");

  const gl = initWebGL(hammerCanvas, {}, true); 
  const vertexShaderSource = document.getElementById('vertex-shader').text;
  const fragmentShaderSource = document.getElementById('fragment-shader').text;
  const vertexShader = initShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = initShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  const program = initProgram(gl, vertexShader, fragmentShader);

  gl.useProgram(program);

  const aPositionPointer = gl.getAttribLocation(program, 'a_position');
  const aNormalPointer = gl.getAttribLocation(program, 'a_normal');

  const uModelMatrixPointer = gl.getUniformLocation(program, 'u_model_matrix');
  const uViewMatrixPointer = gl.getUniformLocation(program, 'u_view_matrix');
  const uProjectionMatrixPointer = gl.getUniformLocation(program, 'u_projection_matrix');
  const uNormalMatrixPointer = gl.getUniformLocation(program, 'u_normal_matrix');

  const uLightDirectionPointer = gl.getUniformLocation(program, 'u_light_direction');
  const uEyePositionPointer = gl.getUniformLocation(program, 'u_eye_position');

  const uLightAmbientPointer = gl.getUniformLocation(program, 'u_light_ambient');
  const uLightDiffusePointer = gl.getUniformLocation(program, 'u_light_diffuse');
  const uLightSpecularPointer = gl.getUniformLocation(program, 'u_light_specular');

  const uMaterialAmbientPointer = gl.getUniformLocation(program, 'u_material_ambient');
  const uMaterialDiffusePointer = gl.getUniformLocation(program, 'u_material_diffuse');
  const uMaterialSpecularPointer = gl.getUniformLocation(program, 'u_material_specular');
  const uMaterialShininessPointer = gl.getUniformLocation(program, 'u_shininess');

  const uEnableAmbientPointer = gl.getUniformLocation(program, 'u_enable_ambient');
  const uEnableDiffusePointer = gl.getUniformLocation(program, 'u_enable_diffuse');
  const uEnableSpecularPointer = gl.getUniformLocation(program, 'u_enable_specular');
  
  gl.enable(gl.DEPTH_TEST);
  
  gl.enableVertexAttribArray(aPositionPointer);
  gl.enableVertexAttribArray(aNormalPointer);
  
  // glmatrix shortcuts
  const mat4 = glMatrix.mat4;
  const toRadian = glMatrix.glMatrix.toRadian;

  let vertexData = [ // coordinates per face
    //flashlight face
    3/3, 0, 0,             0,1,0,  //A //0
    3/3,-0.95/3, 0,        0,1,0,  //B //1
    3/3, 0.95/3, 0,        0,1,0,  //C //2
    3/3, 0, 0.95/3,        0,1,0,  //D //3
    3/3, 0, -0.95/3,       0,1,0,  //E //4
    3/3, 0.75/3, -0.5/3,   0,1,0,  //F //5
    3/3, 0.75/3, 0.5/3,    0,1,0,  //G //6
    3/3, -0.75/3, -0.5/3,  0,1,0,  //H //7
    3/3, -0.75/3, 0.5/3,   0,1,0,  //I //8
    3/3, -0.5/3, 0.75/3,   0,1,0,  //J //9
    3/3, 0.5/3, 0.75/3,    0,1,0,  //K //10
    3/3, -0.5/3, -0.75/3,  0,1,0,  //L //11
    3/3, 0.5/3, -0.75/3,   0,1,0,  //M //12

    //face-body
    2/3, -0.6/3, 0,        0,1,0,  //N //13
    2/3, 0.6/3, 0,         0,1,0,  //O //14
    2/3, 0, 0.6/3,         0,1,0,  //P //15
    2/3, 0, -0.6/3,        0,1,0,  //Q //16

    2/3, -0.3/3, 0.3/3,        0,1,0,  //R //17
    2/3, 0.3/3, 0.3/3,         0,1,0,  //S //18
    2/3, 0.3/3, -0.3/3,         0,1,0,  //T //19
    2/3, -0.3/3, -0.3/3,        0,1,0,  //U //20

    //body-bottom
    -4/3, -0.6/3, 0,        0,1,0,  //V //21
    -4/3, 0.6/3, 0,         0,1,0,  //W //22
    -4/3, 0, 0.6/3,         0,1,0,  //Z //23
    -4/3, 0, -0.6/3,        0,1,0,  //A1 //24
  ];


  let indices2 = [
  // indices of vertices forming triangles
      0,3,10,  0,10,6,  0,6,2,  
      0,2,5,  0,5,12, 0,12,4,  
      0,4,11, 0,11,7,  0,1,7,
      0,1,8,  0,8,9, 0,9,3,
  ];

  let indices = [
  // indices of vertices forming triangles
      0,3,10,  0,10,6,  0,6,2,  
      0,2,5,  0,5,12, 0,12,4,  
      0,4,11, 0,11,7,  0,1,7,
      0,1,8,  0,8,9, 0,9,3,

      15,13,16, 15,14,16,

      15,3,9, 9,15,13,  8,1,13, 8,15,13, 9,8,17,
      3,15,10, 10,15,14,  6,2,14, 6,14,15, 10,6,18,
      2,14,5, 5,14,16,  12,4,16, 12,14,16, 5,12,19,
      1,7,13, 7,13,16,  4,11,16, 11,16,13, 11,7,20,

      23,21,24, 23,22,24,

      13,21,15, 15,21,23,
      15,14,23, 14,23,22,
      14,16,24, 14,22,24,
      13,16,21, 16,24,21
  ];

  

  // create buffer for vertices
  const vbuffer = gl.createBuffer(); 
  gl.bindBuffer(gl.ARRAY_BUFFER, vbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // create another buffer for indices
  const ibuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  // set up transformations
  const uView = mat4.lookAt(mat4.create(), [3,3,7,1.0], [0,0,0,1], [0,1,0,0]);
  const uProj = mat4.perspective(mat4.create(), toRadian(30),hammerCanvas.width/hammerCanvas.height,1,90);
  let uModel = mat4.create()
  let uNormal = mat4.create();
  mat4.invert(uNormal, uModel);
  mat4.transpose(uNormal, uNormal);

  // clear canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  let object2 = {
    "vbuffer": vbuffer,
    "ibuffer": ibuffer,
    "matrix" : {
      "model": uModel,
      "view": uView,
      "proj": uProj,
      "normal": uNormal,
    },
    "eyePosition": [3,3,7], // see view matrix
    "light": {
      "ambient": [1,1,0],
      "diffuse": [1,1,0],
      "specular": [0.9,1.0,0.9],
      "direction": [-1,-2.5,-5],
    },
    "material" : {
      "ambient": [1,1,0],
      "diffuse": [1,1,0],
      "specular": [0.9,1,0.9],
      "shininess": 2.0, // try 0.5; try 3.0
    },
    "flags": {
      "ambient": true,
      "diffuse": true,
      "specular": true,
    },
    "nComponents": 3,
    "nIndices": indices2.length,
  }

  let object = {
    "vbuffer": vbuffer,
    "ibuffer": ibuffer,
    "matrix" : {
      "model": uModel,
      "view": uView,
      "proj": uProj,
      "normal": uNormal,
    },
    "eyePosition": [3,3,7], // see view matrix
    "light": {
      "ambient": [0,0,0],
      "diffuse": [0,0,0],
      "specular": [0.9,1.0,0.9],
      "direction": [-1,-2.5,-5],
    },
    "material" : {
      "ambient": [0,0,0],
      "diffuse": [0,0,0],
      "specular": [0.9,1,0.9],
      "shininess": 2.0, // try 0.5; try 3.0
    },
    "flags": {
      "ambient": true,
      "diffuse": true,
      "specular": true,
    },
    "nComponents": 3,
    "nIndices": indices.length,
  }


  let angleOfRotation = 0;
  let pow = false;
  let down = true;
  
  function hit() {
    pow = true;
  }

  drawObject(object2);
  drawObject(object);
  
  animate();

  function animate() {
    // clear canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    // compute model matrix using angleOfRotation
    uModel = mat4.create()
    mat4.rotateX(uModel, uModel, toRadian(angleOfRotation));
    mat4.rotateY(uModel, uModel, toRadian(180));
    mat4.rotateZ(uModel, uModel, toRadian(100));

    // compute normal matrix
    uNormal = mat4.invert(uNormal, uModel);
    uNormal = mat4.transpose(uNormal, uNormal);

    // set object parameters
    object.matrix.model = uModel;
    object.matrix.normal = uNormal;
    object2.matrix.model = uModel;
    object2.matrix.normal = uNormal;
    
    drawObject(object2);
    drawObject(object);
    
    // update angle for next iter
    if(pow){
      if(angleOfRotation == 0 ){
        down = true;
      }
      if(angleOfRotation == -120){
        down = false;
      }

      if(down){
        angleOfRotation = (angleOfRotation - 30) % 360; 
      }else{
        angleOfRotation = (angleOfRotation + 30) % 360;
        if(angleOfRotation == 0 ){
          pow = false;
        }
      }
    }
   

    
    requestAnimFrame(animate);
  }

  function drawObject(object, primitiveType=gl.TRIANGLES) {
    // set transformations
    gl.uniformMatrix4fv(uModelMatrixPointer, false, object.matrix.model);
    gl.uniformMatrix4fv(uViewMatrixPointer, false, object.matrix.view);
    gl.uniformMatrix4fv(uProjectionMatrixPointer, false, object.matrix.proj);
    gl.uniformMatrix4fv(uNormalMatrixPointer, false, object.matrix.normal);
      
    // set light parameters
    gl.uniform3fv(uLightAmbientPointer, object.light.ambient);
    gl.uniform3fv(uLightDiffusePointer, object.light.diffuse);
    gl.uniform3fv(uLightSpecularPointer, object.light.specular);
    gl.uniform3fv(uLightDirectionPointer, object.light.direction);

    // set material properties
    gl.uniform3fv(uMaterialAmbientPointer, object.material.ambient);
    gl.uniform3fv(uMaterialDiffusePointer, object.material.diffuse);
    gl.uniform3fv(uMaterialSpecularPointer, object.material.specular);
    gl.uniform1f(uMaterialShininessPointer, object.material.shininess);

    // set flags
    gl.uniform1i(uEnableAmbientPointer, object.flags.ambient);
    gl.uniform1i(uEnableDiffusePointer, object.flags.diffuse);
    gl.uniform1i(uEnableSpecularPointer, object.flags.specular);

    // bind vertices
    gl.bindBuffer(gl.ARRAY_BUFFER, object.vbuffer);
    // tell GL how to get vertex positions from buffer
    gl.vertexAttribPointer(aPositionPointer, 3, gl.FLOAT, false, 6*4, 0);
    gl.vertexAttribPointer(aNormalPointer, 3, gl.FLOAT, false, 6*4, 3*4);
    // tell GL how to get normal vectors from buffer

    // bind indices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.ibuffer);
    // draw triangles based on indices array
    gl.drawElements(primitiveType, object.nIndices, gl.UNSIGNED_BYTE, 0)
    
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  }

  document.body.addEventListener("click", hit);
}

main();