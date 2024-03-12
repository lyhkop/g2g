import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { MapControls } from "three/examples/jsm/controls/MapControls";
import { DrawLine, DrawPoint } from "./draw-helper";
import { DrawTool } from "./draw-helper";
import {
  CameraControls,
  CameraControls2,
} from "./camera-controls/editor-controls";

class Engine {
  private _scene: THREE.Scene;
  private _renderer: THREE.WebGLRenderer;
  private _camera: THREE.PerspectiveCamera;
  private _controls: MapControls;
  private _drawTool?: DrawTool;
  private _cameraControls: CameraControls2;
  private _clock: THREE.Clock = new THREE.Clock();
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
    scene.background = new THREE.Color(0.5, 0.3, 0.2);

    const camera = new THREE.PerspectiveCamera(60, 1, 1, 1000);
    camera.position.set(0, 20, 100);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update();
    controls.enabled = false;

    this._scene = scene;
    this._renderer = renderer;
    this._camera = camera;
    this._controls = controls;

    this._cameraControls = new CameraControls2(camera, renderer.domElement);
  }

  get renderer() {
    return this._renderer;
  }

  get scene() {
    return this._scene;
  }

  get controls() {
    return this._controls;
  }

  get camera() {
    return this._camera;
  }

  run() {
    const loop = () => {
      // console.log("render one frame");

      const dt = this._clock.getDelta();

      this._cameraControls.update(dt);

      if (this._resizeRendererToDisplaySize()) {
        const { clientWidth, clientHeight } = this._renderer.domElement;
        this._camera.aspect = clientWidth / clientHeight;
        this._camera.updateProjectionMatrix();
      }

      this._renderer.render(this._scene, this._camera);

      window.requestAnimationFrame(loop);
    };
    loop();
  }

  startDrawPoint() {
    if (this._drawTool) {
      this._scene.remove(this._drawTool.group);
      this._drawTool.destroy();
    }

    const drawTool = new DrawPoint(
      this._renderer.domElement,
      this._camera,
      this._scene
    );
    this._scene.add(drawTool.group);

    this._drawTool = drawTool;
  }

  startDrawLine() {
    if (this._drawTool) {
      this._scene.remove(this._drawTool.group);
    }
    const drawTool = new DrawLine(
      this._renderer.domElement,
      this._camera,
      this._scene
    );
    this._scene.add(drawTool.group);
    this._drawTool = drawTool;
  }

  startDrawPolygon() {
    if (this._drawTool) {
      this._scene.remove(this._drawTool.group);
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (!this._cameraControls.unlocked) {
      // if (event.code == 'Q') {
      //   this.controls.transform.setSpace(
      //     this.controls.transform.space == "local" ? "world" : "local"
      //   );
      // } else if (event.which == Keys.W) {
      //   this.controls.transform.setMode("translate");
      // } else if (event.which == Keys.E) {
      //   this.controls.transform.setMode("rotate");
      // } else if (event.which == Keys.R) {
      //   this.controls.transform.setMode("scale");
      // }
    }
  }

  private _resizeRendererToDisplaySize() {
    const renderer = this._renderer;

    const { width, height, clientWidth, clientHeight } = renderer.domElement;
    const needResize = width !== clientWidth || height !== clientHeight;
    if (needResize) {
      renderer.setSize(clientWidth, clientHeight, false);
    }
    return needResize;
  }
}

export { Engine };
