/**
 * Author: Clinton Poserio
 * 
 * References:  
 *              CMSC 161 Resources by James Plaras
 *              https://www.webglfundamentals.org
 *              https://www.khronos.org/registry/webgl/sdk/devtools/src/debug/webgl-debug.js
 * 
 * Library for initializing webgl context, program and shaders using webgl-units based on various init utilities in webGL
 */

/** 
  * Initialize and get the rendering for WebGL
  * @param canvas <canvas> element
  * @param debug flag to initialize the context for debugging
  * @return the rendering context for WebGL
  */
function initWebGL(canvas, opt_attribs, debug) {
  let gl = WebGLUtils.setupWebGL(canvas, opt_attribs);
  
  if(!gl) return null;

  // if debug is empty or debug is true, create context for debugging
  if (arguments.length < 3 || debug) {
    gl = WebGLDebugUtils.makeDebugContext(gl);
  }

  return gl;
}

/**
  * Create a shader object
  * @param gl WebGL context
  * @param type gl.VERTEX_SHADER || gl.FRAGMENT_SHADER
  * @param source the shader source code
  * @return created shader object; null if failed
  */
function initShader(gl, type, source) {
  // create shader object based on shader type
  const shader = gl.createShader(type);

  if (shader == null){
    console.log("Unable to create shader.");
    return null;
  }

  // insert the shader program
  gl.shaderSource(shader, source);
  // compile the shader program
  gl.compileShader(shader);

  // check status of compilation
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  // if failed
  const error = gl.getShaderInfoLog(shader);
  console.log('Failed to compile shader:' + error);
  gl.deleteShader(shader);
  return null;
}

/**
  * Create a linked program object
  * @param gl WebGL context
  * @param vertexShader a vertex shader created using initShader()
  * @param fratgmentShader a fragment shader created using initShader()
  * @return created program object; null if failed
  */
function initProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  // check status of linking
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  // if failed
  const error = gl.gl.getProgramInfoLog(program);
  console.log("Failed to link program: "+error);
  gl.deleteProgram(program);
  return null;

}