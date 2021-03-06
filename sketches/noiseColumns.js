// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");
const { Scene, ShaderMaterial, PositionalAudio } = require("three");

import vertex from "./shader/vertex.glsl";
import fragmnent from "./shader/fragmnent.glsl";
import portalFragmnent from "./shader/portalFragmnent.glsl";

const settings = {
  // duration: 40,seconds
  // Make the loop animated
  animate: true,
  loop: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl",
  attributes: {
    antialias: true,
  },
};

const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas,
  });

  // WebGL background color
  renderer.setClearColor("f00", 1);

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
  camera.position.set(2, 2, 2);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();

  //Audio
  var listener = new THREE.AudioListener();
  var audio = new THREE.Audio(listener);
  camera.add(listener);

  //create audio context object
  // let audioContext = listener.context();
  // let stream = audioContext.create
  let stream = null;
  let analyser = null;
  navigator.mediaDevices
    .getUserMedia({
      audio: true,
    })
    .then(async (mediaobj) => {
      console.log("media obj", mediaobj);
      stream = await mediaobj;
      gotStream();
    })
    .catch((err) => console.log(err));

  // getMedia();
  const gotStream = () => {
    //set stream as media source ==> goes top speaker
    audio.setMediaStreamSource(stream);
    analyze();
  };

  const analyze = () => {
    // let audioContext = new AudioContext();
    // let analyser = audioContext.createAnalyser();
    // analyser.fftSize = 2048;
    // let mediaStreamSource = audioContext.createMediaStreamSource(stream);
    // mediaStreamSource.connect(analyser);
    // analyser.connect(audioContext.destination);
    // console.log(analyser);
    analyser = new THREE.AudioAnalyser(audio, 32);
  };
  // console.log(analyser);
  //Layers
  let number = 50;

  // create the geometry of the plane for each level
  //  A plane is the two-dimensional analog of a point (zero dimensions), a line (one dimension), and three-dimensional space
  const geometry = new THREE.PlaneBufferGeometry(1, 1).rotateX(Math.PI / 2);
  // -- Rotating the plane --
  // - here we are rotating through the x axis by a magnitude of pi/2 using .rotateX(Math.PI / 2)
  // - using the unit circle (https://i.pinimg.com/originals/1d/89/0d/1d890d831b0f9b8e24124a7bc6a61afb.gif) we can see that by rotating our x axis to pi/2 we would be rotating our object by 90 deegres to the "left" from our starting position (0). If we wanted to rotate 90 degrees to the right if we follow the unit circle we would use the value 3pi/ 2
  // - we can do basic rotation on al axises by doing using this approach

  //PORTAL
  const portalGeometry = new THREE.PlaneBufferGeometry(1.5, 1.5);
  const portalShader = new ShaderMaterial({
    side: THREE.DoubleSide,
    transparent: true,
    vertexShader: vertex,
    fragmentShader: portalFragmnent,
  });

  //-- Setup a material
  //-- MeshBasicMaterial - This colors the faces of the mesh differently based on the face's normal or what direction they are facing.

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
      black: { type: "f", value: 0 },
      audioData: { type: "f", value: 0 },
      // uvRate1: {
      //   value: new THREE.Vector2(1, 1),
      // },
    },
    transparent: true,
    // Shader material Doc has a great explanation about what ver
    vertexShader: vertex,
    fragmentShader: fragmnent,
  });

  const portalMesh = new THREE.Mesh(portalGeometry, portalShader);
  portalMesh.rotateX(Math.PI / 2);

  //GROUPS
  // - designed for containing groups of meshes
  // -adding objects to a group means you can treat them as a single object and rotate/scale/move them as one
  let group = new THREE.Group();
  // const axis = new THREE.Vector3(1, 0, 0);

  group.position.y = -0.5;

  portalMesh.position.y = -0.5;
  scene.add(portalMesh);
  scene.add(group);

  let levelMaterials = [];

  for (let i = 0; i <= number; i++) {
    //create levels that fit within the height of the cube
    let level = i / number;

    // here we are creating the top and bottom layer for each level
    let m0 = shaderMaterial.clone();
    let m1 = shaderMaterial.clone();
    levelMaterials.push(m0);
    levelMaterials.push(m1);
    m0.uniforms.black.value = 1;
    m1.uniforms.black.value = 0;
    m0.uniforms.level.value = level;
    m1.uniforms.level.value = level;

    let mesh = new THREE.Mesh(geometry, m0);
    let mesh1 = new THREE.Mesh(geometry, m1);

    // change y position to each layer to its level
    mesh.position.y = level;
    mesh1.position.y = level - 0.005;
    // mesh.rotation.x -= 0.5;
    // mesh1.rotation.y -= 0.5;

    group.add(mesh);
    group.add(mesh1);
  }

  const portalMove = (yPosition) => {
    const current = yPosition;
  };
  let prevPos = -0.5;
  //1 => up, 0 => down
  let direction = 1;
  // draw each frame
  let audioData = null;
  let audioDataAverage = 1.5;
  if (analyser) {
    // console.log(audioDataAverage);
  }
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    // --NEED TO CONTROL FRAMERATE FOR BETTER PERFORMANCE ---
    async render({ time, playhead, fps }) {
      console.log('RENDER TIME :' , time)
      console.log('Fps :' , fps)

      // console.log("check");
      if (analyser) {
        audioData = analyser.getFrequencyData();
        // console.log(audioData);
        audioDataAverage = audioData.reduce(
          (a, b) => (a + b) / audioData.length
        );
        console.log(audioDataAverage);
      }
      // playhead probably controls the timing of the rendering
      // still unsure where the number comes from or what it represents
      // console.log(fps);
      //setting the uniform playhead value to the playhead valueat each re render
      shaderMaterial.uniforms.playhead.value = playhead;

      await levelMaterials.forEach((material) => {
        material.uniforms.playhead.value = playhead;
        // console.log(audioDataAverage);
        // if (audioDataAverage > 15) {
        //   material.uniforms.audioData.value = 15;
        // } else {
        material.uniforms.audioData.value = audioDataAverage * 8 + 1.5;
        // }
        // console.log(audioDataAverage);
      });
      group.rotation.y -= 0.025;
      // group.rotation.x -= 0.055;
      // group.rotation.z -= 0.015;
      // portalMesh.rotation.y += 0.05;
      // portalMesh.rotation.x += 0.05;
      portalMesh.rotation.z += 0.025;
      portalMesh.rotation.x -= 0.025;

      prevPos = portalMesh.position.y;
      // portalMesh.position.y = portalMesh.position.y + 0.01;

      //function tap moves portal from top to bottom
      // if (
      //   (portalMesh.position.y >= 0.05 && prevPos <= portalMesh.position.y) ||
      //   direction
      // ) {
      //   portalMesh.position.y = portalMesh.position.y + 0.01;
      // }
      // console.log(direction);
      if (
        direction &&
        portalMesh.position.y <= 0.51
        // prevPos <= portalMesh.position.y
      ) {
        if (portalMesh.position.y > 0.5) direction = 0;
        portalMesh.position.y = portalMesh.position.y + 0.005;
        // group.rotation.z = group.rotation.z + 0.055;
      }

      if (!direction && portalMesh.position.y >= -0.5) {
        if (portalMesh.position.y <= -0.5) direction = 1;
        portalMesh.position.y = portalMesh.position.y - 0.005;
        // group.rotation.z = group.rotation.z - 0.025;
      }
      controls.update();

      console.log(requestAnimationFrame())
      // function animate()  {
      //   setTimeout(() => {
      //     requestAnimationFrame()
      //   }, 1000 / fps);
      // }
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
