import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js';

const loadShader = async (path) => {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load shader: ${path}`);
  }
  return response.text();
};

const average = (numbers) => {
  if (!numbers.length) return 0;
  const total = numbers.reduce((sum, value) => sum + value, 0);
  return total / numbers.length;
};

const boot = async () => {
  const [vertexShader, fragmentShader, portalFragment] = await Promise.all([
    loadShader('/sketches/shader/vertex.glsl'),
    loadShader('/sketches/shader/fragmnent.glsl'),
    loadShader('/sketches/shader/portalFragmnent.glsl'),
  ]);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor('#050505', 1);
  document.body.append(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.01,
    100,
  );
  camera.position.set(2, 2, 2);
  camera.lookAt(0, 0, 0);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const listener = new THREE.AudioListener();
  camera.add(listener);
  const audio = new THREE.Audio(listener);

  let analyser = null;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audio.setMediaStreamSource(stream);
    analyser = new THREE.AudioAnalyser(audio, 64);
  } catch (error) {
    console.warn('Microphone access was not granted.', error);
  }

  const planeGeometry = new THREE.PlaneGeometry(1, 1).rotateX(Math.PI / 2);
  const portalGeometry = new THREE.PlaneGeometry(1.5, 1.5);

  const baseMaterial = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    transparent: true,
    uniforms: {
      time: { value: 0 },
      level: { value: 0 },
      playhead: { value: 0 },
      black: { value: 0 },
      audioData: { value: 0 },
    },
    vertexShader,
    fragmentShader,
  });

  const portalMaterial = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    transparent: true,
    vertexShader,
    fragmentShader: portalFragment,
  });

  const portalMesh = new THREE.Mesh(portalGeometry, portalMaterial);
  portalMesh.rotation.x = Math.PI / 2;
  portalMesh.position.y = -0.5;

  const group = new THREE.Group();
  group.position.y = -0.5;
  scene.add(group);
  scene.add(portalMesh);

  const levels = 50;
  const levelMaterials = [];

  for (let i = 0; i <= levels; i += 1) {
    const level = i / levels;

    const topMaterial = baseMaterial.clone();
    topMaterial.uniforms.black.value = 1;
    topMaterial.uniforms.level.value = level;

    const bottomMaterial = baseMaterial.clone();
    bottomMaterial.uniforms.black.value = 0;
    bottomMaterial.uniforms.level.value = level;

    const topMesh = new THREE.Mesh(planeGeometry, topMaterial);
    const bottomMesh = new THREE.Mesh(planeGeometry, bottomMaterial);

    topMesh.position.y = level;
    bottomMesh.position.y = level - 0.005;

    group.add(topMesh, bottomMesh);
    levelMaterials.push(topMaterial, bottomMaterial);
  }

  let portalDirection = 1;
  const startTime = performance.now();

  const animate = () => {
    requestAnimationFrame(animate);

    const elapsed = (performance.now() - startTime) / 1000;
    const playhead = (elapsed % 12) / 12;

    const spectrum = analyser ? analyser.getFrequencyData() : [];
    const audioLevel = average(spectrum) * 0.08 + 1.5;

    for (const material of levelMaterials) {
      material.uniforms.time.value = elapsed;
      material.uniforms.playhead.value = playhead;
      material.uniforms.audioData.value = audioLevel;
    }

    group.rotation.y -= 0.02;
    portalMesh.rotation.z += 0.02;
    portalMesh.rotation.x -= 0.02;

    if (portalDirection && portalMesh.position.y <= 0.51) {
      if (portalMesh.position.y > 0.5) portalDirection = 0;
      portalMesh.position.y += 0.005;
    }

    if (!portalDirection && portalMesh.position.y >= -0.5) {
      if (portalMesh.position.y <= -0.5) portalDirection = 1;
      portalMesh.position.y -= 0.005;
    }

    controls.update();
    renderer.render(scene, camera);
  };

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
};

boot().catch((error) => {
  console.error('Visualizer failed to start.', error);
});
