import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { MapControls } from "three/examples/jsm/controls/MapControls";
import { MeshRenderComponent } from "./mesh-render-component";

class RenderSystem {
  private _scene: THREE.Scene;
  private _renderer: THREE.WebGLRenderer;
  private _camera: THREE.PerspectiveCamera;
  private _controls: MapControls;
  constructor() {
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    const scene = new THREE.Scene();
    // scene.background = new THREE.Color(0.5, 0.3, 0.2);

    const camera = new THREE.PerspectiveCamera(60, 1, 1, 1000);
    camera.position.set(0, 20, 100);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update();
    controls.enabled = true;

    this._scene = scene;
    this._renderer = renderer;
    this._camera = camera;
    this._controls = controls;
  }

  addMeshRender(meshRender: MeshRenderComponent) {
    if (meshRender.mesh) {
      this._scene.add(meshRender.mesh as any);
    }
  }
}

export { RenderSystem };
