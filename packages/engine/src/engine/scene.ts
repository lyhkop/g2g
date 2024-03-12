import * as THREE from 'three';
import { App } from './app';

class Scene3D extends THREE.Scene {
  app: App;
  constructor(app: App) {
    super();
    this.app = app;
  }
}

export { Scene3D };
