import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

function updateShadowCameraBounds(
  light: THREE.DirectionalLight,
  scene: THREE.Scene
) {
  // 更新场景中物体世界矩阵 
  scene.updateMatrixWorld();

  // 计算产生阴影物体包围盒
  const sceneSize = new THREE.Vector3();
  const sceneCenter = new THREE.Vector3();
  const sceneBox = new THREE.Box3();
  scene.traverse((object3d) => {
    if ((object3d instanceof THREE.Mesh || object3d instanceof THREE.SkinnedMesh) && object3d.castShadow) {
      const b = new THREE.Box3()
      b.setFromObject(object3d)
      sceneBox.union(b);
    }
  });
  sceneBox.getSize(sceneSize);
  sceneBox.getCenter(sceneCenter);
  const boundingSphere = new THREE.Sphere()
  sceneBox.getBoundingSphere(boundingSphere);
  const scale = 1.1
  const maxSceneSize = Math.max(sceneSize.x, sceneSize.y, sceneSize.z) * scale;
  const shadowRange = maxSceneSize * 0.5;

  // 更新方向光方向以及视点位置
  const direction = new THREE.Vector3();
  direction.subVectors(light.target.position, light.position)
  const viewpoint = new THREE.Vector3();
  viewpoint.subVectors(sceneCenter, direction.clone().normalize().multiplyScalar(boundingSphere.radius));
  light.position.set(viewpoint.x, viewpoint.y, viewpoint.z)
  light.target.position.set(sceneCenter.x, sceneCenter.y, sceneCenter.z)

  // 更新方向光范围
  light.shadow.camera.left = -shadowRange;
  light.shadow.camera.right = shadowRange;
  light.shadow.camera.top = shadowRange;
  light.shadow.camera.bottom = -shadowRange;
  light.shadow.camera.far = 50000;
  light.shadow.camera.near = 0.1
  light.shadow.needsUpdate = true;
  light.shadow.camera.updateProjectionMatrix();
}

function setModelCastShadow(model: THREE.Object3D, castShadow: boolean) {
  model.traverse((object3d) => {
    object3d.castShadow = castShadow;
  });
}

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

function ShadowPage() {
  const container = useRef<HTMLDivElement>(null);

  const [renderInfo, setRenderInfo] = useState({
    fps: 0,
    triangles: 0,
  });

  const [scene, setScene] = useState<THREE.Scene>();
  const [helper, setHelper] = useState<THREE.CameraHelper>();
  const [light, setLight] = useState<THREE.DirectionalLight>();

  useEffect(() => {
    const { scene, camera, controls, renderer } = init();
    setScene(scene)

    /**
     * add ground
     */
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(1000, 1000),
      new THREE.MeshStandardMaterial()
    );
    ground.rotateX(THREE.MathUtils.degToRad(-90));
    ground.receiveShadow = true;
    ground.castShadow = false
    scene.add(ground);

    /*
     * TorusKnot
     */
    const geometry = new THREE.TorusKnotGeometry(10, 3, 300, 16);
    const material = new THREE.MeshStandardMaterial({ color: "#f00" });
    material.color = new THREE.Color("#049ef4");
    material.roughness = 0.5;
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    // scene.add(mesh);

    /*
     * Lights
     */
    // Ambient Light
    const ambientLight = new THREE.AmbientLight("#ffffff", 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(
      "#ff0000",
      30 /* , 0, 1 */
    );
    directionalLight.position.y = 20;
    directionalLight.position.z = 20;
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.bottom = -20;
    directionalLight.shadow.camera.left = -20;
    scene.add(directionalLight);
    setLight(directionalLight);

    const loader = new GLTFLoader();
    const draco = new DRACOLoader();
    draco.setDecoderPath("./assets/libs/draco");
    loader.setDRACOLoader(draco);
    loader.load("./assets/models/亚运智慧燃气/YYC_001(1).glb", (result: GLTF) => {
      setModelCastShadow(result.scene, true);
      scene.add(result.scene);
      updateShadowCameraBounds(directionalLight, scene);
      const helper = new THREE.CameraHelper(directionalLight.shadow.camera);
      setHelper(helper)
      scene.add(helper);
    });

    /**
     * clock
     */
    const clock = new THREE.Clock();
    clock.start();

    const info = {
      fps: 0,
      triangles: 0,
    };

    /**
     * loop
     */
    function tick(): void {
      setRenderInfo({
        fps: 1 / clock.getDelta(),
        triangles: renderer.info.render.triangles,
      });
      info.fps = 1 / clock.getDelta();
      info.triangles = renderer.info.render.triangles;

      renderer.render(scene, camera);
      window.requestAnimationFrame(tick);
    }

    tick();

    setInterval(() => {
      setRenderInfo({ ...info });
    }, 500);

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
      draco.setDecoderPath("./assets/libs/draco");
      loader.setDRACOLoader(draco);
      if (arrayBuffer) {
        loader.parseAsync(arrayBuffer, '').then((result: GLTF)=>{
          if (scene) {
            setModelCastShadow(result.scene, true);
            scene.add(result.scene)
            if (light) {
              updateShadowCameraBounds(light, scene);
              if (helper) {
                helper.update()
              }
            }
          }
        })
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDragOver = (event: any) => {
    event.preventDefault();
  };

  return (
    <>
      <div className="absolute top-0 left-0 text-white">
        <div>{`fps: ${renderInfo.fps.toFixed(2)}`}</div>
        <div>{`renderTriangles: ${renderInfo.triangles}`}</div>
      </div>
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

export default ShadowPage;
