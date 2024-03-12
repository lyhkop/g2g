/* eslint-disable @typescript-eslint/no-explicit-any */
import * as THREE from "three";
import {
  EasyTwinSceneOptions,
  ModelComponentDataOptions,
  SceneResourcesType,
  TextureUserData,
} from "./twin_type";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

class AssetManager {

  // _glTFResourcesMap: Map<string, GLTFResourcesMap> = new Map();
  glTFResourcePromiseMap: Map<string, Promise<GLTF>> = new Map()

}

const assetMgr = new AssetManager()

function deepCopy(obj: any) {
  // 使用JSON序列化和反序列化实现深拷贝
  return JSON.parse(JSON.stringify(obj));
}

function textureFromJSON(json: any) {
  const texture = new THREE.Texture();
  texture.name = json.name;
  texture.mapping = json.mapping;
  (texture as any).channel = json.channel;
  texture.repeat = new THREE.Vector2(json.repeat[0], json.repeat[1]);
  texture.offset = new THREE.Vector2(json.offset[0], json.offset[1]);
  texture.center = new THREE.Vector2(json.center[0], json.center[1]);
  texture.rotation = json.rotation;
  // eslint-disable-next-line prefer-destructuring
  texture.wrapS = json.wrap[0];
  // eslint-disable-next-line prefer-destructuring
  texture.wrapT = json.wrap[1];
  texture.format = json.format;
  texture.internalFormat = json.internalFormat;
  texture.type = json.type;
  (texture as any).colorSpace = json.colorSpace;
  texture.minFilter = json.minFilter;
  texture.magFilter = json.magFilter;
  texture.anisotropy = json.anisotropy;
  texture.flipY = json.flipY;
  texture.generateMipmaps = json.generateMipmaps;
  texture.premultiplyAlpha = json.premultiplyAlpha;
  texture.unpackAlignment = json.unpackAlignment;
  if (Object.keys(json.userData).length > 0)
    texture.userData = deepCopy(json.userData);
  return texture;
}

function setServerDataToTextureUserData(
  serverData: {
    id: string;
    name: string;
    tag: string;
  },
  texture: THREE.Texture
) {
  const userData = texture.userData as TextureUserData;
  userData.serverData = {
    ...userData.serverData,
    type: "texture",
    id: serverData.id,
    name: serverData.name,
    tag: serverData.tag,
  };
}

function materialFromJSON(
  json: any,
  textures: { [key: string]: THREE.Texture }
) {
  function getTexture(name: string) {
    const t = textures[name];
    if (t === undefined) {
      console.log("材质纹理引用丢失");
    }
    return t;
  }

  const material = (THREE.MaterialLoader as any).createMaterialFromType(
    json.type
  ) as any;

  // if ( json.uuid !== undefined ) material.uuid = json.uuid; // json中没有存储uuid
  if (json.name !== undefined) material.name = json.name;
  if (json.color !== undefined && material.color !== undefined)
    material.color.setHex(json.color);
  if (json.roughness !== undefined) material.roughness = json.roughness;
  if (json.metalness !== undefined) material.metalness = json.metalness;
  if (json.sheen !== undefined) material.sheen = json.sheen;
  if (json.sheenColor !== undefined)
    material.sheenColor = new THREE.Color().setHex(json.sheenColor);
  if (json.sheenRoughness !== undefined)
    material.sheenRoughness = json.sheenRoughness;
  if (json.emissive !== undefined && material.emissive !== undefined)
    material.emissive.setHex(json.emissive);
  if (json.specular !== undefined && material.specular !== undefined)
    material.specular.setHex(json.specular);
  if (json.specularIntensity !== undefined)
    material.specularIntensity = json.specularIntensity;
  if (json.specularColor !== undefined && material.specularColor !== undefined)
    material.specularColor.setHex(json.specularColor);
  if (json.shininess !== undefined) material.shininess = json.shininess;
  if (json.clearcoat !== undefined) material.clearcoat = json.clearcoat;
  if (json.clearcoatRoughness !== undefined)
    material.clearcoatRoughness = json.clearcoatRoughness;
  if (json.iridescence !== undefined) material.iridescence = json.iridescence;
  if (json.iridescenceIOR !== undefined)
    material.iridescenceIOR = json.iridescenceIOR;
  if (json.iridescenceThicknessRange !== undefined)
    material.iridescenceThicknessRange = json.iridescenceThicknessRange;
  if (json.transmission !== undefined)
    material.transmission = json.transmission;
  if (json.thickness !== undefined) material.thickness = json.thickness;
  if (json.attenuationDistance !== undefined)
    material.attenuationDistance = json.attenuationDistance;
  if (
    json.attenuationColor !== undefined &&
    material.attenuationColor !== undefined
  )
    material.attenuationColor.setHex(json.attenuationColor);
  if (json.anisotropy !== undefined) material.anisotropy = json.anisotropy;
  if (json.anisotropyRotation !== undefined)
    material.anisotropyRotation = json.anisotropyRotation;
  if (json.fog !== undefined) material.fog = json.fog;
  if (json.flatShading !== undefined) material.flatShading = json.flatShading;
  if (json.blending !== undefined) material.blending = json.blending;
  if (json.combine !== undefined) material.combine = json.combine;
  if (json.side !== undefined) material.side = json.side;
  if (json.shadowSide !== undefined) material.shadowSide = json.shadowSide;
  if (json.opacity !== undefined) material.opacity = json.opacity;
  if (json.transparent !== undefined) material.transparent = json.transparent;
  if (json.alphaTest !== undefined) material.alphaTest = json.alphaTest;
  if (json.depthTest !== undefined) material.depthTest = json.depthTest;
  if (json.depthWrite !== undefined) material.depthWrite = json.depthWrite;
  if (json.colorWrite !== undefined) material.colorWrite = json.colorWrite;

  if (json.stencilWrite !== undefined)
    material.stencilWrite = json.stencilWrite;
  if (json.stencilWriteMask !== undefined)
    material.stencilWriteMask = json.stencilWriteMask;
  if (json.stencilFunc !== undefined) material.stencilFunc = json.stencilFunc;
  if (json.stencilRef !== undefined) material.stencilRef = json.stencilRef;
  if (json.stencilFuncMask !== undefined)
    material.stencilFuncMask = json.stencilFuncMask;
  if (json.stencilFail !== undefined) material.stencilFail = json.stencilFail;
  if (json.stencilZFail !== undefined)
    material.stencilZFail = json.stencilZFail;
  if (json.stencilZPass !== undefined)
    material.stencilZPass = json.stencilZPass;

  if (json.wireframe !== undefined) material.wireframe = json.wireframe;
  if (json.wireframeLinewidth !== undefined)
    material.wireframeLinewidth = json.wireframeLinewidth;
  if (json.wireframeLinecap !== undefined)
    material.wireframeLinecap = json.wireframeLinecap;
  if (json.wireframeLinejoin !== undefined)
    material.wireframeLinejoin = json.wireframeLinejoin;

  if (json.rotation !== undefined) material.rotation = json.rotation;

  if (json.linewidth !== 1) material.linewidth = json.linewidth;
  if (json.dashSize !== undefined) material.dashSize = json.dashSize;
  if (json.gapSize !== undefined) material.gapSize = json.gapSize;
  if (json.scale !== undefined) material.scale = json.scale;

  if (json.polygonOffset !== undefined)
    material.polygonOffset = json.polygonOffset;
  if (json.polygonOffsetFactor !== undefined)
    material.polygonOffsetFactor = json.polygonOffsetFactor;
  if (json.polygonOffsetUnits !== undefined)
    material.polygonOffsetUnits = json.polygonOffsetUnits;

  if (json.dithering !== undefined) material.dithering = json.dithering;

  if (json.alphaToCoverage !== undefined)
    material.alphaToCoverage = json.alphaToCoverage;
  if (json.premultipliedAlpha !== undefined)
    material.premultipliedAlpha = json.premultipliedAlpha;
  if (json.forceSinglePass !== undefined)
    material.forceSinglePass = json.forceSinglePass;

  if (json.visible !== undefined) material.visible = json.visible;

  if (json.toneMapped !== undefined) material.toneMapped = json.toneMapped;

  if (json.userData !== undefined) material.userData = json.userData;

  if (json.vertexColors !== undefined) {
    if (typeof json.vertexColors === "number") {
      material.vertexColors = json.vertexColors > 0;
    } else {
      material.vertexColors = json.vertexColors;
    }
  }

  // Shader Material

  if (json.uniforms !== undefined) {
    for (const name in json.uniforms) {
      const uniform = json.uniforms[name];

      material.uniforms[name] = {};

      switch (uniform.type) {
        case "t":
          material.uniforms[name].value = getTexture(uniform.value);
          break;

        case "c":
          material.uniforms[name].value = new THREE.Color().setHex(
            uniform.value
          );
          break;

        case "v2":
          material.uniforms[name].value = new THREE.Vector2().fromArray(
            uniform.value
          );
          break;

        case "v3":
          material.uniforms[name].value = new THREE.Vector3().fromArray(
            uniform.value
          );
          break;

        case "v4":
          material.uniforms[name].value = new THREE.Vector4().fromArray(
            uniform.value
          );
          break;

        case "m3":
          material.uniforms[name].value = new THREE.Matrix3().fromArray(
            uniform.value
          );
          break;

        case "m4":
          material.uniforms[name].value = new THREE.Matrix4().fromArray(
            uniform.value
          );
          break;

        default:
          material.uniforms[name].value = uniform.value;
      }
    }
  }

  if (json.defines !== undefined) material.defines = json.defines;
  if (json.vertexShader !== undefined)
    material.vertexShader = json.vertexShader;
  if (json.fragmentShader !== undefined)
    material.fragmentShader = json.fragmentShader;
  if (json.glslVersion !== undefined) material.glslVersion = json.glslVersion;

  if (json.extensions !== undefined) {
    for (const key in json.extensions) {
      material.extensions[key] = json.extensions[key];
    }
  }

  if (json.lights !== undefined) material.lights = json.lights;
  if (json.clipping !== undefined) material.clipping = json.clipping;

  // for PointsMaterial

  if (json.size !== undefined) material.size = json.size;
  if (json.sizeAttenuation !== undefined)
    material.sizeAttenuation = json.sizeAttenuation;

  // maps

  if (json.map !== undefined) material.map = getTexture(json.map);
  if (json.matcap !== undefined) material.matcap = getTexture(json.matcap);

  if (json.alphaMap !== undefined)
    material.alphaMap = getTexture(json.alphaMap);

  if (json.bumpMap !== undefined) material.bumpMap = getTexture(json.bumpMap);
  if (json.bumpScale !== undefined) material.bumpScale = json.bumpScale;

  if (json.normalMap !== undefined)
    material.normalMap = getTexture(json.normalMap);
  if (json.normalMapType !== undefined)
    material.normalMapType = json.normalMapType;
  if (json.normalScale !== undefined) {
    let { normalScale } = json;

    if (Array.isArray(normalScale) === false) {
      // Blender exporter used to export a scalar. See #7459

      normalScale = [normalScale, normalScale];
    }

    material.normalScale = new THREE.Vector2().fromArray(normalScale);
  }

  if (json.displacementMap !== undefined)
    material.displacementMap = getTexture(json.displacementMap);
  if (json.displacementScale !== undefined)
    material.displacementScale = json.displacementScale;
  if (json.displacementBias !== undefined)
    material.displacementBias = json.displacementBias;

  if (json.roughnessMap !== undefined)
    material.roughnessMap = getTexture(json.roughnessMap);
  if (json.metalnessMap !== undefined)
    material.metalnessMap = getTexture(json.metalnessMap);

  if (json.emissiveMap !== undefined)
    material.emissiveMap = getTexture(json.emissiveMap);
  if (json.emissiveIntensity !== undefined)
    material.emissiveIntensity = json.emissiveIntensity;

  if (json.specularMap !== undefined)
    material.specularMap = getTexture(json.specularMap);
  if (json.specularIntensityMap !== undefined)
    material.specularIntensityMap = getTexture(json.specularIntensityMap);
  if (json.specularColorMap !== undefined)
    material.specularColorMap = getTexture(json.specularColorMap);

  if (json.envMap !== undefined) material.envMap = getTexture(json.envMap);
  if (json.envMapIntensity !== undefined)
    material.envMapIntensity = json.envMapIntensity;

  if (json.reflectivity !== undefined)
    material.reflectivity = json.reflectivity;
  if (json.refractionRatio !== undefined)
    material.refractionRatio = json.refractionRatio;

  if (json.lightMap !== undefined)
    material.lightMap = getTexture(json.lightMap);
  if (json.lightMapIntensity !== undefined)
    material.lightMapIntensity = json.lightMapIntensity;

  if (json.aoMap !== undefined) material.aoMap = getTexture(json.aoMap);
  if (json.aoMapIntensity !== undefined)
    material.aoMapIntensity = json.aoMapIntensity;

  if (json.gradientMap !== undefined)
    material.gradientMap = getTexture(json.gradientMap);

  if (json.clearcoatMap !== undefined)
    material.clearcoatMap = getTexture(json.clearcoatMap);
  if (json.clearcoatRoughnessMap !== undefined)
    material.clearcoatRoughnessMap = getTexture(json.clearcoatRoughnessMap);
  if (json.clearcoatNormalMap !== undefined)
    material.clearcoatNormalMap = getTexture(json.clearcoatNormalMap);
  if (json.clearcoatNormalScale !== undefined)
    material.clearcoatNormalScale = new THREE.Vector2().fromArray(
      json.clearcoatNormalScale
    );

  if (json.iridescenceMap !== undefined)
    material.iridescenceMap = getTexture(json.iridescenceMap);
  if (json.iridescenceThicknessMap !== undefined)
    material.iridescenceThicknessMap = getTexture(json.iridescenceThicknessMap);

  if (json.transmissionMap !== undefined)
    material.transmissionMap = getTexture(json.transmissionMap);
  if (json.thicknessMap !== undefined)
    material.thicknessMap = getTexture(json.thicknessMap);

  if (json.anisotropyMap !== undefined)
    material.anisotropyMap = getTexture(json.anisotropyMap);

  if (json.sheenColorMap !== undefined)
    material.sheenColorMap = getTexture(json.sheenColorMap);
  if (json.sheenRoughnessMap !== undefined)
    material.sheenRoughnessMap = getTexture(json.sheenRoughnessMap);

  return material;
}

function setServerDataToMaterialUserData(
  serverData: {
    id: string;
    name: string;
    tag: string;
    type: string;
  },
  material: THREE.Material
) {
  const userData = material.userData as TextureUserData;
  userData.serverData = {
    ...userData.serverData,
    type: serverData.type as any,
    id: serverData.id,
    name: serverData.name,
    tag: serverData.tag,
  };
}

function preLoadGLBResources(sceneData: EasyTwinSceneOptions) {
  const promisesMap: Map<string, Promise<GLTF>> = new Map();
  const entityIdsMap: Map<string, string> = new Map();
  sceneData.entities.forEach((item) => entityIdsMap.set(item.id, item.id));
  const modelCompOptions = sceneData.components
    .filter((item) => item.type === "Model")
    .filter((item) => entityIdsMap.has(item.objId));

  const glbURLList = [
    ...new Set(
      modelCompOptions.map(
        (item) => (item.data as ModelComponentDataOptions).asset.url
      )
    ),
  ];
  glbURLList.forEach((item) => {
    const loader = new GLTFLoader();
    const promise = loader.loadAsync(item);
    promisesMap.set(item, promise);
  });
  return promisesMap;
}

function parseTextures(sceneResources: SceneResourcesType[]) {
  return sceneResources
    .filter((item) => item.type === "texture")
    .map((item) => {
      const texture = textureFromJSON(item.config);
      setServerDataToTextureUserData(item, texture);
      return texture;
    });
}

function parseMaterials(
  sceneResources: SceneResourcesType[],
  texturesCache: { [key: string]: THREE.Texture }
) {
  return sceneResources
    .filter(
      (item) =>
        item.type === "privateMaterial" || item.type === "publicMaterial"
    )
    .map((item) => {
      const material = materialFromJSON(item.config, texturesCache);
      setServerDataToMaterialUserData(item, material);
      return material;
    });
}

function loadTextureSourceData(texture: THREE.Texture) {
  if (!texture.source.data) {
    const userData = texture.userData as TextureUserData
    if (userData.source.url) {
      // 
      const promise = assetMgr.glTFResourcePromiseMap.get(userData.source.url)
      if (promise) {
        promise.then(glb=>{
          //
        })
      }
    }
  }
}

function parseEntities(
  sceneData: EasyTwinSceneOptions,
  sceneResources: SceneResourcesType[]
) {
  // 预加载GLB文件
  assetMgr.glTFResourcePromiseMap = preLoadGLBResources(sceneData);

  // 解析纹理和材质
  const textures = parseTextures(sceneResources);
  const texturesCache: { [key: string]: THREE.Texture } = {};
  textures.forEach((item) => (texturesCache[item.uuid] = item));
  const materials = parseMaterials(sceneResources, texturesCache);

}
