import * as THREE from 'three';
import { Component } from './component';
import { Scene3D } from './scene';

class Entity extends THREE.Group {
  private _components: Component[] = [];

  scene: Scene3D | null = null;

  override readonly type = 'Entity';

  constructor(name?: string, scene?: Scene3D) {
    super();

    this.name = name ?? 'unnamed';

    if (scene) {
      scene.add(this);
      this.scene = scene;
    }
  }

  addComponent(component: Component) {
    this._components.push(component);
    component.entity = this;

    if (this.scene !== null) {
      component.init();
    }
  }

  removeComponent(component: Component) {
    const index = this._components.indexOf(component);
    if (index !== -1) {
      this._components.splice(index, 1);
      component.entity = null;
    }
  }

  getComponent<T extends Component>(type: { new (): T }): T | null {
    for (const component of this._components) {
      if (component instanceof type) {
        return component as T;
      }
    }
    return null;
  }

  update(deltaTime: number) {
    this._components.forEach((component) => {
      component.update(deltaTime);
    });
  }
}

export { Entity };
