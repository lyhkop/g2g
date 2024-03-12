import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MapControls } from 'three/examples/jsm/controls/MapControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { CustomCameraControls } from './custom-camera-controls';
import { isNil } from 'lodash-es';
import { InfiniteGrid } from './infinite-grid';
import { Entity } from './entity';
import localForage from 'localforage';
import { ModelRenderComponent } from './model-render-component';
import useEditorStore from '../store/editor-store';
import { App } from './app';
import { Scene3D } from './scene';
import { nanoid } from 'nanoid';
import {
  cloneModel,
  findParentByType,
  getModelResources,
} from './utils/model-utils';

enum EditorEvent {
  Pick_Object = 'pickObject',
  Update_Object = 'updateObject',
}

type SceneNode = { name: string; children: number[] };

class Editor extends App {
  private _renderer: THREE.WebGLRenderer;
  private _camera: THREE.PerspectiveCamera;
  private _controls: MapControls | PointerLockControls | CustomCameraControls;
  private _clock: THREE.Clock = new THREE.Clock();
  private _selectedObjects: THREE.Object3D[] = [];
  private _transformControls: TransformControls;
  private _helpers: Record<string, THREE.Object3D> = {};

  private _scene: Scene3D;
  private _sceneHelpers: THREE.Scene;

  private _entities: Entity[] = [];

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

  get selectedObjects() {
    return this._selectedObjects;
  }

  get transformControls() {
    return this._transformControls;
  }

  constructor() {
    super();

    // 渲染器
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    // 相机
    const camera = new THREE.PerspectiveCamera(60, 1, 1, 1000);
    camera.position.set(0, 20, 100);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // 相机控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    // 场景
    const scene = new THREE.Scene();
    scene.name = 'scene';
    const sceneHelpers = new THREE.Scene();
    sceneHelpers.add(new InfiniteGrid(10, 100) as any);

    // gizmo辅助器
    const transformControls = new TransformControls(
      camera,
      renderer.domElement
    );
    transformControls.addEventListener('change', () => {
      const object = transformControls.object;

      if (object !== undefined) {
        // box.setFromObject(object, true);

        const helper = this._helpers[object.uuid] as THREE.Object3D & {
          isSkeletonHelper: boolean;
          update: () => void;
        };

        if (helper !== undefined && helper.isSkeletonHelper !== true) {
          helper.update();
        }

        // signals.refreshSidebarObject3D.dispatch(object);
        this.emit(EditorEvent.Update_Object, object);
      }
    });
    transformControls.addEventListener('mouseDown', () => {
      const object = transformControls.object;

      // objectPositionOnDown = object.position.clone();
      // objectRotationOnDown = object.rotation.clone();
      // objectScaleOnDown = object.scale.clone();

      controls.enabled = false;
    });
    transformControls.addEventListener('mouseUp', () => {
      controls.enabled = true;
      const object = transformControls.object;
      this.emit(EditorEvent.Update_Object, object);
    });
    sceneHelpers.add(transformControls);

    this._renderer = renderer;
    this._camera = camera;
    this._controls = controls;
    this._scene = new Scene3D(this);
    this._sceneHelpers = sceneHelpers;
    this._transformControls = transformControls;
  }

  init() {
    this._initEvents();

    const loop = () => {
      this._renderer.render(this._scene, this._camera);
      this._renderer.autoClear = false;
      this._renderer.render(this._sceneHelpers, this._camera);
      this._renderer.autoClear = true;

      window.requestAnimationFrame(loop);
    };
    loop();
  }

  addObject(object: THREE.Object3D, helper?: THREE.Object3D) {
    this._scene.add(object);
    this._selectedObjects = [object];
    if (!isNil(helper)) {
      this._sceneHelpers.add(helper);
      this._helpers[object.uuid] = helper;
    }
  }

  addLight(light: THREE.DirectionalLight) {
    const material = new THREE.SpriteMaterial();
    this.assetManager
      .loadTexture('./assets/images/lightbulb.png')
      .then((texture) => {
        material.map = texture;
        material.needsUpdate = true;
      });
    const lightIcon = new THREE.Sprite();
    lightIcon.material = material;
    lightIcon.name = 'picker';
    lightIcon.userData.object = light;
    this._scene.add(light);
    this._sceneHelpers.add(lightIcon);
    this._helpers[light.uuid] = lightIcon;
  }

  addEntity(entity: Entity) {
    this._entities.push(entity);
    this._updateSceneNodes();
  }

  createModelComponent(uri: string) {
    const component = new ModelRenderComponent();
    component.props.config.uri = uri;

    const entity = new Entity(nanoid(), this.scene);
    // 实体挂在组件
    entity.addComponent(component);

    // 场景中增加实体，并更新编辑器场景树
    this.addEntity(entity);

    // 更新IndexDB
    this._updateEntities2IndexDB();

    // 加载模型资源
    this.getModelFromCache(uri).then((result) => {
      if (result) {
        const clonedModel = cloneModel(result);
        // 设置组件引用的模型
        component.model = clonedModel as any;
        // 将模型添加到实体的根节点中
        entity.add(component.model as any);
      }
    });

    return entity;
  }

  getModelFromCache(uri: string) {
    if (this.assetManager.cache.hasModel(uri)) {
      const modelResource = this.assetManager.cache.getModel(uri);
      return Promise.resolve(modelResource);
    } else {
      localForage.config({
        name: 'G2G',
        storeName: 'data',
      });
      return localForage.getItem(uri).then((data) => {
        return this.assetManager
          .parseGLB(data as ArrayBuffer)
          .then((result) => {
            this.assetManager.cache.setModel(uri, result.scene);
            const modelResource = this.assetManager.cache.getModel(uri);
            return modelResource;
          });
      });
    }
  }

  private _updateSceneNodes() {
    const nodes: SceneNode[] = [];
    this._entities.forEach((entity) => {
      nodes.push({
        name: entity.name,
        children: [],
      });
    });
    // 更新UI
    useEditorStore.getState().setSceneNodes(nodes);
  }

  private _updateEntities2IndexDB() {
    const entities: (SceneNode & { components: any[] })[] = [];
    this._entities.forEach((entity) => {
      const components = [];
      const modelComponent = entity.getComponent(ModelRenderComponent);
      if (modelComponent) {
        components.push(modelComponent.toJson());
      }
      entities.push({
        name: entity.name,
        children: [],
        components,
      });
    });
    localForage.config({
      name: 'G2G',
      storeName: 'data',
    });
    localForage.setItem('entities', entities);
  }

  findModelComponentByObject3D(object3d: THREE.Object3D) {
    const entity = this._findObject3DEntity(object3d);
    if (entity) {
      const modelComponent = (entity as Entity).getComponent(
        ModelRenderComponent
      );
      if (modelComponent) {
        return modelComponent;
      }
    }
  }

  private _findObject3DEntity(object3d: THREE.Object3D) {
    return findParentByType(object3d, 'Entity');
  }

  setSelectedObjects(objects: THREE.Object3D[]) {
    this._selectedObjects = objects;
  }

  private _initEvents() {
    const dom = this._renderer.domElement;

    let isDragging = false;
    let startPosition: THREE.Vector2 | null = null;

    const onMouseDown = (event: MouseEvent) => {
      isDragging = false;
      startPosition = new THREE.Vector2(event.clientX, event.clientY);
    };

    const onMouseMove = (event: MouseEvent) => {
      if (startPosition) {
        const currentPosition = new THREE.Vector2(event.clientX, event.clientY);
        const distance = currentPosition.distanceTo(startPosition);

        if (distance > 1) {
          isDragging = true;
        }
      }
    };

    const onMouseUp = (event: MouseEvent) => {
      if (!isDragging) {
        this._pickObject(event);
      }

      startPosition = null;
      isDragging = false;
    };

    dom.addEventListener('mousedown', onMouseDown, false);
    dom.addEventListener('mousemove', onMouseMove, false);
    dom.addEventListener('mouseup', onMouseUp, false);
  }

  private _pickObject(event: MouseEvent) {
    if (event.button !== THREE.MOUSE.LEFT) return;

    const canvas = this._renderer.domElement;
    const rect = canvas.getBoundingClientRect();

    const x = (2 * (event.clientX - rect.left)) / rect.width - 1;
    const y = (-2 * (event.clientY - rect.top)) / rect.height + 1;

    const camera = this._camera;

    const rayCaster = new THREE.Raycaster();
    rayCaster.setFromCamera(new THREE.Vector2(x, y), camera);

    const objects: THREE.Object3D[] = [];

    this._scene.traverseVisible(function (child) {
      objects.push(child);
    });

    this._sceneHelpers.traverseVisible(function (child) {
      if (child.name === 'picker') objects.push(child);
    });

    const result = rayCaster.intersectObjects(objects, false);
    if (result.length > 0) {
      const { object } = result[0];
      if (!isNil(object.userData.object)) {
        this.emit(EditorEvent.Pick_Object, object.userData.object);
        this._transformControls.attach(object.userData.object);
      } else {
        this.emit(EditorEvent.Pick_Object, object);
        if (!isNil(object)) this._transformControls.attach(object);
      }
    } else {
      this._transformControls.detach();
    }
  }

  destroy() {
    this._renderer.dispose();
    this.removeAllListeners();
  }

  saveScene() {
    try {
      const data = {
        name: 'test',
      };
      localForage.config({
        name: 'G2G',
        storeName: 'data',
      });
      localForage.setItem('scene', data).then((value) => {
        console.log(value);
      });
    } catch (error) {
      console.log(error);
    }
  }

  async openScene() {
    try {
      localForage.config({
        name: 'G2G',
        storeName: 'data',
      });

      const modelList =
        ((await localForage.getItem('modelList')) as string[]) ?? [];
      useEditorStore.getState().setModelList(modelList);

      const entities =
        ((await localForage.getItem('entities')) as (SceneNode & {
          components: any[];
        })[]) ?? [];

      entities.forEach((entity) => {
        const e = new Entity(entity.name, this._scene);
        entity.components.forEach((c) => {
          if (c.type === 'ModelRenderComponent') {
            const resourceName = c.model;
            if (this.assetManager.cache.hasModel(resourceName)) {
              const modelResource =
                this.assetManager.cache.getModel(resourceName);
              const component = new ModelRenderComponent();
              if (modelResource) {
                modelResource.name = resourceName;
                component.model = cloneModel(modelResource) as any;
              }
              e.addComponent(component);
              this.addEntity(e);
            } else {
              localForage.getItem(resourceName).then(async (data) => {
                const result = await this.assetManager.parseGLB(
                  data as ArrayBuffer
                );
                this.assetManager.cache.setModel(resourceName, result.scene);
                const modelResource =
                  this.assetManager.cache.getModel(resourceName);
                const component = new ModelRenderComponent();
                if (modelResource) {
                  modelResource.name = resourceName;
                  component.model = cloneModel(modelResource) as any;
                }
                e.addComponent(component);
                if (component.model) {
                  e.add(component.model as any);
                }
                this.addEntity(e);
              });
            }
          }
        });
      });

      localForage.getItem('').then((data) => {
        console.log('sss', data);
      });
    } catch (error) {
      console.log(error);
    }
  }
}

export { Editor, EditorEvent };
