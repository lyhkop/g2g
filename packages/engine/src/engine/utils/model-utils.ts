import * as THREE from "three";
import { GLTFLoader, GLTFParser } from "three/examples/jsm/loaders/GLTFLoader";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";

export function cloneModel(model: THREE.Object3D) {
  return SkeletonUtils.clone(model);
}

export function getMaterialsMap(model: THREE.Object3D) {
  const result: Map<THREE.Material, THREE.Object3D[]> = new Map();

  model.traverse((object3d) => {
    if (
      object3d instanceof THREE.Mesh ||
      object3d instanceof THREE.SkinnedMesh
    ) {
      const { material } = object3d as THREE.Mesh;
      if (Array.isArray(material)) {
        material.forEach((m) => {
          if (!result.has(m)) {
            result.set(m, []);
          }
          result.get(m)?.push(object3d);
        });
      } else {
        if (!result.has(material)) {
          result.set(material, []);
        }
        result.get(material)?.push(object3d);
      }
    }
  });

  return result;
}

export function getModelNodes(model: THREE.Object3D) {
  const nodes: THREE.Object3D[] = [];
  model.traverse((object3d) => {
    nodes.push(object3d);
  });
  return nodes;
}

export function findParentByType(object3d: THREE.Object3D, type: string) {
  if (object3d.type === "Entity") {
    return object3d;
  } else if (object3d.parent !== null) {
    return findParentByType(object3d.parent, type);
  } else {
    return null;
  }
}

export function getModelResources(model: THREE.Object3D) {
  const nodes: THREE.Object3D[] = [];
  const meshes: (THREE.Mesh | THREE.SkinnedMesh)[] = [];
  const materials: THREE.Material[] = [];
  const textures: THREE.Texture[] = [];
  const hasMaterial = (material: THREE.Material) => {
    return !!materials.find((m) => m.uuid === material.uuid);
  };
  const hasTexture = (texture: THREE.Texture) => {
    return !!textures.find((t) => t.uuid === texture.uuid);
  };
  model.traverse((object) => {
    nodes.push(object);
    if (object instanceof THREE.Mesh || object instanceof THREE.SkinnedMesh) {
      meshes.push(object);
      const { material } = object as THREE.Mesh;
      if (!Array.isArray(material)) {
        if (!hasMaterial(material)) {
          materials.push(material);
        }
      } else {
        material.forEach((m) => {
          if (!hasMaterial(m)) {
            materials.push(m);
          }
        });
      }
    }
  });
  materials.forEach((material) => {
    let key: keyof THREE.Material;
    for (key in material) {
      if (material[key] instanceof THREE.Texture) {
        if (!hasTexture(material[key])) {
          textures.push(material[key]);
        }
      }
    }
  });
  return {
    nodes,
    meshes,
    materials,
    textures,
  };
}

export async function getRenderResourcesFromArrayBuffer(
  arrayBuffer: ArrayBuffer
): Promise<{
  textures: THREE.Texture[];
  materials: THREE.Material[];
  meshes: (THREE.Mesh | THREE.SkinnedMesh | THREE.InstancedMesh)[];
  animations: THREE.AnimationClip[];
  scene: THREE.Object3D;
}> {
  const loader = new GLTFLoader();
  return loader.parseAsync(arrayBuffer, "").then((result) => {
    const { animations, scene } = result;
    const json = result.parser.json;
    const meshes = new Array<
      THREE.Mesh | THREE.SkinnedMesh | THREE.InstancedMesh
    >(json?.meshes?.length ?? 0);
    const textures = new Array<THREE.Texture>(json?.textures?.length ?? 0);
    const materials = new Array<THREE.Material>(json?.materials?.length ?? 0);
    const associations = result.parser.associations;
    associations.forEach((value, key) => {
      if (key instanceof THREE.Mesh || key instanceof THREE.SkinnedMesh) {
        if (meshes.length > 0 && value && value.meshes !== undefined) {
          meshes[value.meshes] = key;
        }
      } else if (key instanceof THREE.Material) {
        if (materials.length > 0 && value && value.materials !== undefined) {
          materials[value.materials] = key;
        }
      } else if (key instanceof THREE.Texture) {
        if (textures.length > 0 && value && value.textures !== undefined) {
          textures[value.textures] = key;
        }
      }
    });

    return {
      textures,
      materials,
      meshes,
      animations,
      scene,
    };
  });
}
