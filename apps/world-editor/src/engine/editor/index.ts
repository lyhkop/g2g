import * as THREE from "three";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { Engine } from "..";
import { Entity } from "../entity";
import { EventEmitter } from "events";
import { InfiniteGridHelper } from "../object/InfiniteGridHelper";

class Editor extends THREE.Object3D {
  private _engine: Engine;
  private _event: EventEmitter = new EventEmitter();
  private _transformControls!: TransformControls;
  private _root: THREE.Group = new THREE.Group();
  constructor() {
    super();
    this._engine = new Engine();

    const { scene, camera, renderer } = this._engine;
    const ground = new InfiniteGridHelper(10, 100);
    ground.name = "InfiniteGridHelper";
    const helper = new THREE.Group();
    helper.add(ground);
    helper.name = "SceneHelper";
    scene.add(helper);
    scene.add(this._root);

    this._transformControls = new TransformControls(
      camera,
      renderer.domElement
    );
    helper.add(this._transformControls);

    this._initEvents();
  }

  get engine() {
    return this._engine;
  }

  get root() {
    return this._root;
  }

  createEntity(name: string) {
    const entity = new Entity(name);
    this._addEntityToScene(entity);
    return entity;
  }

  createBox(
    name: string,
    options?: {
      width: number;
      height: number;
      depth: number;
    }
  ) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(options?.width, options?.height, options?.depth)
    );
    const entity = new Entity(name);
    entity.add(mesh);
    this._addEntityToScene(entity);
    return entity;
  }

  updateEntityTransform(
    id: string,
    options: {
      position: THREE.Vector3;
      rotation: THREE.Euler;
      scale: THREE.Vector3;
    }
  ) {
    const object = this._engine.scene.getObjectByProperty("uuid", id);
    object?.position.copy(options.position);
    object?.rotation.copy(options.rotation);
    object?.scale.copy(options.scale);
  }

  private _initEvents() {
    let isDrag = false;
    let timer: any = null;
    const downPosition = new THREE.Vector2();
    const upPosition = new THREE.Vector2();
    window.addEventListener("mousedown", (event: MouseEvent) => {
      isDrag = false;
      downPosition.set(event.clientX, event.clientY);
      timer = setTimeout(() => {
        isDrag = true;
      }, 200);
    });

    window.addEventListener("mousemove", (event: MouseEvent) => {
      console.log("draging");
    });

    window.addEventListener("mouseup", (event: MouseEvent) => {
      upPosition.set(event.clientX, event.clientY);
      const distance = upPosition.distanceTo(downPosition);
      if (!isDrag && distance < 0.1) {
        clearTimeout(timer);
        this._pickObject(event);
      } else {
        isDrag = false;

        if (this._transformControls.object) {
          const obj = this._transformControls.object;
          this.dispatchEvent({
            type: "selected:changed",
            id: obj.uuid,
          });
        }
      }
    });
  }

  private _pickObject(event: MouseEvent) {
    if (event.button !== THREE.MOUSE.LEFT) return;

    const canvas = this._engine.renderer.domElement;
    const rect = canvas.getBoundingClientRect();

    const x = (2 * (event.clientX - rect.left)) / rect.width - 1;
    const y = (-2 * (event.clientY - rect.top)) / rect.height + 1;

    const camera = this._engine.camera;

    const rayCaster = new THREE.Raycaster();
    rayCaster.setFromCamera(new THREE.Vector2(x, y), camera);

    const result = rayCaster.intersectObjects(this._root.children);
    if (result.length > 0) {
      const object = result[0];

      this._transformControls.attach(object.object);

      this.dispatchEvent({
        type: "selected:changed",
        id: object.object.uuid,
      });
    } else {
      this._transformControls.detach();
    }
  }

  private _addEntityToScene(entity: Entity) {
    this._root.add(entity);
    this.dispatchEvent({ type: "scene:update" });
    this._event.emit("scene:update");
  }
}

export { Editor };
