uniform float time;
uniform vec2 vUv;
uniform vec4 vPosition;
uniform vec2 pixels;

void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0)
}

