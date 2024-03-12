export interface ObjPropertyVo {
  id: string;
  name: string;
  type: string;
  sceneId: string;
  commonConfig: object;
  hierarchyConfig: object;
  parentObjId: string | null;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
  /** @format date-time */
  deletedAt: string | null;
  mpath: string;
}

export interface StateVo {
  id: string;
  name: string;
  rank: number;
  config: object;
}

export interface ComponentVo {
  id: string;
  objId: string;
  type: string;
  name: string;
  data: object;
  attribute: object[];
  rank: number;
  version: number;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
  states?: StateVo[];
}

export interface EasyTwinSceneOptions {
  entities: ObjPropertyVo[];
  components: ComponentVo[];
}

export type SceneResourcesType = {
  id: string;
  tag: string;
  sceneId: string;
  name: string;
  type: "model" | "publicMaterial" | "privateMaterial" | "image" | "texture";
  config: object;
  /** @format date-time */
  updatedAt: string;
  /** @format date-time */
  createdAt: string;
};

export type MaterialUserData = {
  source: {
    url: string | "editor";
    indexId: string;
  };
  defaultConfig: {
    [key: string]: any;
  };
  serverData: {
    type: "privateMaterial" | "publicMaterial";
    id: string;
    name: string;
    tag: string;
  };
};

export type TextureUserData = {
  source: {
    url: string | "editor";
    indexId: string; // glTF的loader返回值中textureSource的key
    imageId: number; // gltf中image的索引
  };
  defaultConfig: {
    [key: string]: any;
  };
  serverData: {
    type: "texture";
    id: string;
    name: string;
    tag: string;
  };
};

export type ModelComponentDataOptions = {
  asset: {
    id: string;
    url: string;
  };
};