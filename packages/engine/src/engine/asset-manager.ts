import { EventEmitter } from 'events';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { addTrailingSlash } from './utils/url-utils';
import * as THREE from 'three';

class AssetCache {
  hasModel(key: string) {
    return this._models.has(key);
  }

  getModelKeys() {
    return this._models.keys();
  }

  getModel(key: string) {
    return this._models.get(key);
  }

  setModel(key: string, model: THREE.Object3D) {
    this._models.set(key, model);
  }

  private _models: Map<string, THREE.Object3D> = new Map();
}

class AssetManager extends EventEmitter {
  private _cache: AssetCache = new AssetCache();

  private _dracoPath = './assets/libs/draco/';

  set dracoPath(path: string) {
    this._dracoPath = addTrailingSlash(path);
  }

  get dracoPath() {
    return this._dracoPath;
  }

  get cache() {
    return this._cache;
  }

  parseGLB(data: ArrayBuffer) {
    const loader = new GLTFLoader();
    const draco = new DRACOLoader();
    draco.setDecoderPath(this._dracoPath);
    loader.setDRACOLoader(draco);

    return loader.parseAsync(data, '').then((result) => {
      return result;
    });
  }

  loadTexture(url: string) {
    const loader = new THREE.TextureLoader();
    return loader.loadAsync(url).then((result) => {
      return result;
    });
  }
}

export { AssetManager };
