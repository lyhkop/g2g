import { Component } from './component';

class MeshRenderComponent extends Component {
  init(): void {
    throw new Error('Method not implemented.');
  }
  mesh?: THREE.Mesh;
  constructor() {
    super('MeshRenderComponent');
  }

  update(deltaTime: number): void {
    throw new Error('Method not implemented.');
  }
}

export { MeshRenderComponent };
