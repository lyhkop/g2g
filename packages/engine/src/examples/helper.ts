import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { MapControls } from "three/examples/jsm/controls/MapControls"

function initTHREE(canvas?: HTMLCanvasElement, logarithmicDepthBuffer = false) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    1,
    100000000
  );

  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas, logarithmicDepthBuffer: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  const controls = new MapControls(camera, renderer.domElement);
  controls.target = new THREE.Vector3(0, 0.01, 0);
  controls.update();
  // controls.enabled = false

  return {
    camera,
    scene,
    renderer,
    controls,
  };
}

function resizeRendererToParent(renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) {
  const parentElement = renderer.domElement.parentElement ?? renderer.domElement  
  const { clientWidth, clientHeight } = parentElement;
  const { width, height } = renderer.getSize(new THREE.Vector2())
  const needResize = width !== clientWidth || height !== clientHeight;
  if (needResize) {
    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
  }
}

export { initTHREE, resizeRendererToParent };
