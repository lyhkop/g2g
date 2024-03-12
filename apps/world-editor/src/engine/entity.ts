import { Object3D } from "three";

class Entity extends Object3D {
  constructor(name?: string) {
    super();
    this.name = name ?? "";
  }
}

export { Entity };
