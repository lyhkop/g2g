import { nanoid } from 'nanoid';
import { Entity } from './entity';

abstract class Component {
  entity: Entity | null = null;
  ref?: THREE.Object3D;
  name = '';
  type = '';
  id: string;
  readonly props: Record<string, any> = {};
  constructor(type: string) {
    this.type = type;
    this.id = nanoid();
  }
  abstract init(): void;
  abstract update(deltaTime: number): void;
  toJson() : {
    name: string,
    type: string,
  } {
    return {
      name: this.name,
      type: this.type,
    };
  }

  fromJson(json: any) {
    this.name = json.name;
  }
}

export { Component };
