import { useEffect, useRef, useState } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";

function init() {
  /**
   * camera
   */
  const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    1,
    200000
  );
  camera.position.z = 50;

  /**
   * scene
   */
  const scene = new THREE.Scene();

  /**
   * Renderer
   */
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.render(scene, camera);

  /**
   * controls
   */
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.update();

  /**
   * shadow
   */
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  return {
    scene,
    camera,
    controls,
    renderer,
  };
}

function deepCloneGroup(group: THREE.Group) {
  const materialMap = new Map<
    string,
    | THREE.MeshBasicMaterial
    | THREE.MeshStandardMaterial
    | THREE.MeshPhysicalMaterial
  >();
  const textureMap = new Map<string, THREE.Texture>();

  const deepCloneMaterial = (
    material: THREE.MeshBasicMaterial,
    textureMap: Map<string, THREE.Texture>
  ) => {
    const clonedMaterial = material.clone();
    Object.entries(clonedMaterial).forEach(([k, v]) => {
      if (v instanceof THREE.Texture) {
        if (!textureMap.has(v.uuid)) {
          textureMap.set(v.uuid, v.clone());
        }
        (clonedMaterial as any)[k] = textureMap.get(v.uuid);
      }
    });
    return clonedMaterial;
  };

  group.traverse((object3d) => {
    if (
      object3d instanceof THREE.Mesh ||
      object3d instanceof THREE.SkinnedMesh ||
      object3d instanceof THREE.InstancedMesh
    ) {
      if (!Array.isArray(object3d.material)) {
        if (!materialMap.has(object3d.material.uuid)) {
          const clonedMaterial = deepCloneMaterial(
            object3d.material,
            textureMap
          );
          materialMap.set(object3d.material.uuid, clonedMaterial);
        }
        object3d.material = materialMap.get(object3d.material.uuid);
      }
    }
  });
}

type MeshRenderResource = {
  geometries: Record<string, unknown>;
  materials: Record<string, unknown>;
  textures: Record<string, unknown>;
  images: Record<string, unknown>;
  shapes: Record<string, unknown>;
  skeletons: Record<string, unknown>;
  animations: Record<string, unknown>;
  nodes: Record<string, unknown>;
};

function gatherModelRenderResources(scene: THREE.Group) {
  const resources: MeshRenderResource = {
    geometries: {},
    materials: {},
    textures: {},
    images: {},
    shapes: {},
    skeletons: {},
    animations: {},
    nodes: {}
  };
  scene.traverse((object3d) => {
    if (
      object3d instanceof THREE.Mesh ||
      object3d instanceof THREE.SkinnedMesh ||
      object3d instanceof THREE.InstancedMesh
    ) {
      const mesh = object3d as THREE.Mesh;
      resources.geometries[mesh.geometry.uuid] = mesh.geometry;
      if (!Array.isArray(mesh.material)) {
        resources.materials[mesh.material.uuid] = mesh.material;
        Object.entries(mesh.material).forEach(([k, v]) => {
          if (v instanceof THREE.Texture) {
            resources.textures[v.uuid] = v;
          }
        });
      }
    }
  });
  return resources;
}

function serializeModelToJson(scene: THREE.Group) {
  const resource = gatherModelRenderResources(scene);
  const json = scene.toJSON(resource);
  return {
    json,
    resource,
  };
}

function addResourceToDummyResource(json: any, dummyResource: MeshRenderResource) {
  if (!dummyResource.geometries[json.geometry]) {
    dummyResource.geometries[json.geometry] = {
      source: {
        url: '',
        indexId: ''
      }
    }
  }
  if (!dummyResource.materials[json.material]) {
    dummyResource.materials[json.material] = {}
  }
}

function gatherDummyRenderResource(json: any, dummyResource: MeshRenderResource) {
  if (json.type === 'Mesh' || json.type === 'SkinnedMesh') {
    if (!dummyResource.geometries[json.geometry]) {
      addResourceToDummyResource(json, dummyResource);
    }
  }
  for (let index = 0; index < json.children.length; index++) {
    const element = json.children[index];
    if (element.type === 'Mesh' || element.type === 'SkinnedMesh') {
      addResourceToDummyResource(element, dummyResource);
    }
    gatherDummyRenderResource(element, dummyResource)
  }
}

function gatherModelDummyRenderResource(json: any) {
  const dummyResource: MeshRenderResource = {
    geometries: {},
    materials: {},
    textures: {},
    images: {},
    shapes: {},
    skeletons: {},
    animations: {},
    nodes: {}
  }
  gatherDummyRenderResource(json, dummyResource)
  return dummyResource;
}

function loadRealMaterial(dummyResource: MeshRenderResource) {
  Object.entries(dummyResource.materials).forEach(([k, v])=>{
    dummyResource.materials[k] = new THREE.MeshBasicMaterial()
  })
}
function loadRealGeometry(dummyResource: MeshRenderResource) {
  Object.entries(dummyResource.geometries).forEach(([k, v])=>{
    const url = v.source.url;
    const indexId = v.source.indexId;
    // 从glb获取mesh
  })
}

function deserializeModelFromJson(json: any) {
  const dummyResource = gatherModelDummyRenderResource(json.object)
  loadRealMaterial(dummyResource)
  loadRealGeometry(dummyResource)
  json = {...json, ...dummyResource}
  const loader = new THREE.ObjectLoader()
  const scene = loader.parseObject(json.object, json.geometries, json.materials, json.textures)
  return scene;
}

function GLTFResourcesPage() {
  const container = useRef<HTMLDivElement>(null);

  const [scene, setScene] = useState<THREE.Scene>();

  useEffect(() => {
    const { scene, camera, controls, renderer } = init();
    setScene(scene);

    /**
     * add ground
     */
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(1000, 1000),
      new THREE.MeshStandardMaterial()
    );
    ground.rotateX(THREE.MathUtils.degToRad(-90));
    ground.receiveShadow = true;
    ground.castShadow = false;
    scene.add(ground);

    /*
     * Lights
     */
    // Ambient Light
    const ambientLight = new THREE.AmbientLight("#ffffff", 0.5);
    scene.add(ambientLight);

    /**
     * clock
     */
    const clock = new THREE.Clock();
    clock.start();

    /**
     * loop
     */
    function tick(): void {
      renderer.render(scene, camera);
      window.requestAnimationFrame(tick);
    }
    window.requestAnimationFrame(tick);

    /**
     * attach to div
     */
    if (container.current) {
      container.current.appendChild(renderer.domElement);
    }

    const div = container.current;
    return () => {
      div?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  const [file, setFile] = useState(null);

  const handleDrop = (event: any) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    setFile(file);
    readFile(file);
  };

  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    setFile(file);
    readFile(file);
  };

  const readFile = (file: any) => {
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result;
      console.log("ArrayBuffer:", arrayBuffer);
      const loader = new GLTFLoader();
      const draco = new DRACOLoader();
      draco.setDecoderPath("./assets/libs/draco/");
      loader.setDRACOLoader(draco);
      if (arrayBuffer) {
        loader.parseAsync(arrayBuffer, "").then(async (result: GLTF) => {
          const { json, resource } = serializeModelToJson(result.scene);
          const scene = deserializeModelFromJson(json)
          debugger
          const clonedScene = deepCloneGroup(result.scene);
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDragOver = (event: any) => {
    event.preventDefault();
  };

  return (
    <>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{ border: "2px dashed #ccc", padding: "20px" }}
      >
        <input type="file" accept=".bin" onChange={handleFileChange} />
      </div>
      <div ref={container} />
    </>
  );
}

export default GLTFResourcesPage;
