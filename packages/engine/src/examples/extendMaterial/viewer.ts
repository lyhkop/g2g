import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

function init() {
  /**
   * camera
   */
  const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    1,
    2000
  );
  camera.position.z = 20;

  /**
   * scene
   */
  const scene = new THREE.Scene();

  /**
   * Renderer
   */
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.render(scene, camera);

  /**
   * controls
   */
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.update();

  return {
    scene,
    camera,
    controls,
    renderer,
  };
}

export {init}