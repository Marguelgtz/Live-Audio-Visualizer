// vec4 - four dimensional vector of floating point precision
uniform float playhead;
uniform float level;
uniform float time; 
uniform float black; 

varying vec2 vUv;

float PI = 3.14159265359;

// -- uv refers to texture cordinates --
// OPEN GL TEXTURE - https://learnopengl.com/Getting-started/Textures
//TEXTURE COORDINATES - Texture coordinates define how an image (or portion of an image) gets mapped to a geometry. A texture coordinate is associated with each vertex on the geometry, and it indicates what point within the texture image should be mapped to that vertex.
// https://docs.safe.com/fme/html/FME_Desktop_Documentation/FME_Workbench/!FME_Geometry/Texture_Coordinates.htm

//Perlin noise ==> quick video explaining it => https://www.youtube.com/watch?v=H6FhG9VKhJg
//	Classic Perlin 3D Noise 
//	by Stefan Gustavson

void main(){
  float width = .1;
  float border = smoothstep(0.05, width, vUv.x );
  float border1 = smoothstep(0.05, width, vUv.y );
  float border2 = smoothstep(0.05, width, 1. - vUv.x );
  float border3 = smoothstep(0.05, width, 1. - vUv.y );

  border *= border1 * border2 * border3;

  if(border == 1.) discard;
  
  gl_FragColor = vec4(vec3(1.),border);
}

