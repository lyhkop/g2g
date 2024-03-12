import { Component } from './component';
import { Range } from './utils/d';
import { getModelResources } from './utils/model-utils';

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type JsonType = {
  [key: string]: JsonValue;
};

type ModelData = {
  nodes: JsonType[];
  meshes: JsonType[];
  materials: JsonType[];
  textures: JsonType[];
};

type MetaType = {
  textures: { [key: string]: any };
  images: { [key: string]: any };
};

interface ModelRenderComponentProps {
  name: string;
  type: string;
  config: {
    uri: string;
    json: ModelData;
  }
}

class ModelRenderComponent extends Component {
  @Range(0, 100)
  public myNumber = 0;

  override props: ModelRenderComponentProps = {
    name: '',
    type: 'ModelRenderComponent',
    config: {
      uri: '',
      json: {
        nodes: [],
        meshes: [],
        materials: [],
        textures: []
      }
    }
  };

  get model() {
    return this.ref;
  }

  set model(object3d: THREE.Object3D | undefined) {
    this.ref = object3d;
    if (object3d) {
      const modelResources = getModelResources(object3d as any);
      this.materials = [...modelResources.materials] as any;
      this.nodes = [...modelResources.nodes] as any;
    } else {
      this.materials = [];
      this.nodes = [];
    }
  }

  materials: THREE.Material[] = [];

  nodes: THREE.Object3D[] = [];

  constructor() {
    super('ModelRenderComponent');
  }

  init(): void {
    console.log('模型组件初始化');
  }

  update(_deltaTime: number): void {
    console.log('模型组件更新');
  }

  toJson(): ModelRenderComponentProps {
    const baseJson = super.toJson();
    const model = this.ref;

    const meta: MetaType = {
      textures: {},
      images: {},
    };
    const materialsJson = this.materials.map((m) => {
      return m.toJSON(meta);
    });
    const nodesJson = this.nodes.map((n) => {
      return {
        uuid: n.uuid,
        materials: [],
      };
    });

    return {
      ...baseJson,
      config: {
        uri: '',
        json: {
          nodes: [],
          meshes: [],
          materials: [],
          textures: []
        }
      }
    };
  }

  fromJson(json: ModelRenderComponentProps): void {
    super.fromJson(json);
    
  }
}

export { ModelRenderComponent };
