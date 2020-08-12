varying vec2 vUv;
void main() {
  // creating a copy 'varying' of the texture coordinates
  //-- Varying ==> are variables that are passed from the vertex shader to the fragment shader. For each fragment, the value of each varying will be smoothly interpolated from the values of adjacent vertices.
  vUv = uv;
  // Note that you can therefore calculate the position of a vertex in the vertex shader by:
 gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}