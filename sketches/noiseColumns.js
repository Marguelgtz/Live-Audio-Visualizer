// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");
const { Scene } = require("three");

import vertex from "./shader/vertex.glsl";
import fragment from "./shader/fragmnent.glsl";

const settings = {
  duration: 20, //seconds
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl",
};

const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas,
  });

  // WebGL background color
  renderer.setClearColor("#000", 1);

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
  camera.position.set(2, 2, 2);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();

  //Layers
  let number = 10;

  // create the geometry of the plane for each level
  //  A plane is the two-dimensional analog of a point (zero dimensions), a line (one dimension), and three-dimensional space
  const geometry = new THREE.PlaneBufferGeometry(1, 1).rotateX(Math.PI / 2);
  // -- Rotating the plane --
  // - here we are rotating through the x axis by a magnitude of pi/2 using .rotateX(Math.PI / 2)
  // - using the unit circle (https://i.pinimg.com/originals/1d/89/0d/1d890d831b0f9b8e24124a7bc6a61afb.gif) we can see that by rotating our x axis to pi/2 we would be rotating our object by 90 deegres to the "left" from our starting position (0). If we wanted to rotate 90 degrees to the right if we follow the unit circle we would use the value 3pi/ 2
  // - we can do basic rotation on al axises by doing using this approach

  //-- Setup a material
  //-- MeshBasicMaterial - This colors the faces of the mesh differently based on the face's normal or what direction they are facing.
  let material = new THREE.MeshBasicMaterial({ wireframe: true });

  //-- Material Docs => https://threejs.org/docs/#api/en/materials/Material
  //-- Shader MaterIAL Docs => https://threejs.org/docs/#api/en/materials/ShaderMaterial

  let shaderMaterial = new THREE.ShaderMaterial({
    extensions: {
      // https://developer.mozilla.org/en-US/docs/Web/API/OES_standard_derivatives
      // interesting stackoverflow about what they do (still don't understand... seems like a good starting point to start researching)=> https://stackoverflow.com/questions/16365385/explanation-of-dfdx
      derivatives: "#extension GL_OES_standard_derivative : true",
    },
    //Side =- Defines which side of faces will be rendered
    side: THREE.DoubleSide,
    // Uniforms are global GLSL variables. They are passed to shader programs.
    // -- uniforms are values that are accessible on your shaders (from a react dev perspective, I think of them as props that the shader recieves )
    uniforms: {
      time: { type: "f", value: 0 },
      level: { type: "f", value: 0 },
      playhead: { type: "f", value: 0 },
      uvRate1: {
        value: new THREE.Vector2(1, 1),
      },
    },
    // Shader material Doc has a great explanation about what ver
    vertexShader: vertex,
    fragmentShader: fragment,
  });

  //GROUPS
  // - designed for containing groups of meshes
  // -adding objects to a group means you can treat them as a single object and rotate/scale/move them as one
  let group = new THREE.Group();

  scene.add(group);

  for (let i = 0; i < number; i++) {
    //create levels that fit within the height of the cube
    let level = i / number;

    let mesh = new THREE.Mesh(geometry, shaderMaterial);

    // change y position to each layer to its level
    mesh.position.y = level;
    group.add(mesh);
  }

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render({ time, playhead }) {
      // console.log(time);
      shaderMaterial.uniforms.playhead.value = playhead;

      controls.update();
      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      controls.dispose();
      renderer.dispose();
    },
  };
};

canvasSketch(sketch, settings);
