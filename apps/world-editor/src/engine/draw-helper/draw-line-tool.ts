import * as THREE from "three";
import { DrawTool } from "./draw-tool";

class DrawLine implements DrawTool {
  group: THREE.Group = new THREE.Group();
  canvas: HTMLCanvasElement;
  camera: THREE.Camera;
  scene: THREE.Scene;
  layers: THREE.Layers;

  points: THREE.Vector3[] = [];

  bufferGeometry = new THREE.BufferGeometry();

  point0?: THREE.Vector3;
  point1?: THREE.Vector3;

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

    const lines = new THREE.LineSegments(
      this.bufferGeometry,
      new THREE.LineBasicMaterial({
        color: new THREE.Color(1, 0, 0),
      })
    );
    this.group.add(lines);

    let isClick = false;
    const positions: THREE.Vector3[] = [];
    let floatingPoint: THREE.Mesh | undefined;
    const editEntities: THREE.Mesh[] = [];

    window.addEventListener("mousedown", (event: MouseEvent) => {
      if (event.button === 0) {
        isClick = false;
        const position = this._pick();
        if (position) {
          if (positions.length === 0) {
            floatingPoint = this.drawShape(position);
            editEntities.push(floatingPoint);
            positions.push(position);
          }
        }
      }
    });
  }

  drawShape(position: THREE.Vector3) {
    return new THREE.Mesh();
  }

  _pick() {
    return new THREE.Vector3();
  }

  updateLine() {
    if (this.points.length > 1) this.bufferGeometry.setFromPoints(this.points);
  }

  destroy() {
    this.group.clear();
  }
}

export { DrawLine };
