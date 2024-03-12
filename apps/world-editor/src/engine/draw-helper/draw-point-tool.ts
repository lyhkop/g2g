import * as THREE from "three";
import { DrawTool } from "./draw-tool";

class DrawPoint implements DrawTool {
  group: THREE.Group = new THREE.Group();
  canvas: HTMLCanvasElement;
  camera: THREE.Camera;
  scene: THREE.Scene;
  layers: THREE.Layers;

  private _onClickHandler = this._onClick.bind(this);

  constructor(
    canvas: HTMLCanvasElement,
    camera: THREE.Camera,
    scene: THREE.Scene
  ) {
    const layers = new THREE.Layers();
    layers.set(1);
    this.canvas = canvas;
    this.camera = camera;
    this.scene = scene;
    this.layers = layers;
    this.init();
  }

  rayCast(
    event: MouseEvent,
    rect: { x: number; y: number; width: number; height: number },
    camera: THREE.Camera,
    scene: THREE.Scene,
    layers: THREE.Layers
  ) {
    const x = ((event.clientX - rect.x) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.y) / rect.height) * 2 + 1;

    const rayCaster = new THREE.Raycaster();
    rayCaster.setFromCamera(new THREE.Vector2(x, y), camera);
    const result = rayCaster.intersectObjects(scene.children);
    if (result.length > 0) {
      console.log(result[0]);
      if (result[0].object.layers.test(layers)) return;
      this.drawPoint(result[0].point);
    }
  }

  init() {
    window.addEventListener("click", this._onClickHandler);
  }

  private _onClick(event: MouseEvent) {
    if (event.button == 0) {
      console.log("单击鼠标左键");
      this.rayCast(
        event,
        this.canvas.getBoundingClientRect(),
        this.camera,
        this.scene,
        this.layers
      );
    } else if (event.button == 2) {
      console.log("单击鼠标右键");
    }
  }

  destroy() {
    this.group.clear();
    window.removeEventListener("click", this._onClickHandler);
  }

  drawPoint(position: THREE.Vector3) {
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        color: new THREE.Color(1, 0, 0),
      })
    );
    sprite.position.copy(position);
    sprite.layers.enable(1);
    this.group.add(sprite);
  }
}

export { DrawPoint };
