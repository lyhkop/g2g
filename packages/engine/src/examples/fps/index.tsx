import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";


function getModelTriangles(model: THREE.Object3D) {
  const meshSet: Set<THREE.Mesh | THREE.SkinnedMesh> = new Set();
  
  model.traverse(object3d=>{
    if (object3d instanceof THREE.Mesh || object3d instanceof THREE.SkinnedMesh) {
      meshSet.add(object3d)
    }
  });

  let triangleCount = 0;

  [...meshSet].forEach(mesh=>{
    const {geometry} = mesh as THREE.Mesh
    if (geometry instanceof THREE.BufferGeometry) {
      if (geometry.index) {
        triangleCount += (geometry.index.count / 3);
      } else {
        const position = geometry.getAttribute('position');
        triangleCount += position.count / 3;
      }
    }
  })

  return triangleCount
}

function init() {
  /**
   * camera
   */
  const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    1,
    200
  );
  camera.position.z = 0.1;

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

  return {
    scene,
    camera,
    controls,
    renderer
  }
}

function FPSPage() {
  const container = useRef<HTMLDivElement>(null);

  const [renderInfo, setRenderInfo] = useState({
    fps: 0,
    triangles: 0
  })
  const [modelTriangles, setModelTriangles] = useState(0)

  useEffect(() => {

    const {scene, camera, controls, renderer} = init()

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
    // Point light
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
    // RectAreaLight
    const rectAreaLight = new THREE.RectAreaLight("#ff0", 1, 50, 50);
    rectAreaLight.position.z = 10;
    rectAreaLight.position.y = -40;
    rectAreaLight.position.x = -20;
    rectAreaLight.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(rectAreaLight);

    const loader = new GLTFLoader();
    const draco = new DRACOLoader();
    draco.setDecoderPath("./assets/libs/draco");
    loader.setDRACOLoader(draco);
    loader.load("./assets/models/Cesium_Man.glb", (result: GLTF) => {
      scene.add(result.scene);
      setModelTriangles(getModelTriangles(result.scene))
    });

    /**
     * clock
     */
    const clock = new THREE.Clock();
    clock.start();

    const info = {
      fps: 0,
      triangles: 0
    }

    /**
     * loop
     */
    function tick(): void {

      // setRenderInfo({
      //   fps: 1 / clock.getDelta(),
      //   triangles: renderer.info.render.triangles
      // });
      info.fps = 1 / clock.getDelta()
      info.triangles = renderer.info.render.triangles

      renderer.render(scene, camera);
      window.requestAnimationFrame(tick);
    }

    tick();

    setInterval(()=>{
      setRenderInfo({...info});
    }, 500)

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

  return (
    <>
      <div className="absolute top-0 left-0 text-white">
        <div>{`fps: ${renderInfo.fps.toFixed(2)}`}</div>
        <div>{`renderTriangles: ${renderInfo.triangles}`}</div>
        <div>{`modelTriangles: ${modelTriangles}`}</div>
      </div>
      <div className="absolute bottom-0 text-white">计算FPS和三角面</div>
      <div ref={container} />
    </>
  );
}

export default FPSPage;
