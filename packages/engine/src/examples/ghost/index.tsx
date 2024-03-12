import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { preProcessModel } from "./model-processor";
import GUI from "lil-gui";

function init() {
  /**
   * camera
   */
  const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    1,
    2000
  );
  camera.position.z = 500;

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
    renderer,
  };
}

function handleColorChange(color: THREE.Color) {
  return function (value: any) {
    if (typeof value === "string") {
      value = value.replace("#", "0x");
    }

    color.setHex(value);
  };
}

function GhostPage() {
  const container = useRef<HTMLDivElement>(null);

  const [renderInfo, setRenderInfo] = useState({
    fps: 0,
    triangles: 0,
  });

  useEffect(() => {
    const { scene, camera, controls, renderer } = init();

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
      "#111111",
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
    // scene.add(directionalLight);

    // gui
    const gui = new GUI();
    gui.add(document, "title");

    const loader = new GLTFLoader();
    const draco = new DRACOLoader();
    draco.setDecoderPath("./assets/libs/draco/");
    loader.setDRACOLoader(draco);
    loader.load(
      "./assets/models/亚运智慧燃气/地下廊道0912_222.glb",
      (result: GLTF) => {
        const { fresnelMaterial: material } = preProcessModel(result.scene);

        const materialParams = {
          uColor: material.uniforms.uColor.value.getHex(),
          uRimColor: material.uniforms.uRimColor.value.getHex(),
          uFresnelFactor: material.uniforms.uFresnelFactor.value,
          uFresnelBias: material.uniforms.uFresnelBias.value,
          uIntensity: material.uniforms.uIntensity.value
        };

        gui.addColor(materialParams, "uColor").onChange((color: any) => {
          handleColorChange(material.uniforms.uColor.value)(color);
        });
        gui.addColor(materialParams, "uRimColor").onChange((color: any)=>{
          handleColorChange(material.uniforms.uRimColor.value)(color);
        });
        gui.add(materialParams, "uFresnelFactor").onChange((v:any)=>{
          material.uniforms.uFresnelFactor.value = v
        })
        gui.add(materialParams, "uFresnelBias").onChange((v:any)=>{
          material.uniforms.uFresnelBias.value = v
        })
        gui.add(materialParams, "uIntensity").onChange((v:any)=>{
          material.uniforms.uIntensity.value = v
        })
        
        scene.add(result.scene);
      }
    );

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
      info.fps = 1 / clock.getDelta();
      info.triangles = renderer.info.render.triangles;

      renderer.render(scene, camera);
      window.requestAnimationFrame(tick);
    }

    tick();

    // setInterval(()=>{
    //   setRenderInfo({...info});
    // }, 500)

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
      gui.destroy();
    };
  }, []);

  return (
    <>
      <div className="absolute top-0 left-0 text-white">
        <div>{`fps: ${renderInfo.fps.toFixed(2)}`}</div>
        <div>{`renderTriangles: ${renderInfo.triangles}`}</div>
      </div>
      <div className="absolute bottom-0 text-white">科幻风格</div>
      <div ref={container} />
    </>
  );
}

export default GhostPage;
