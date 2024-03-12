import { useEffect, useRef } from "react";
import classNames from "classnames";
import { initTHREE, resizeRendererToParent } from "../helper";
import { Sky } from "three/examples/jsm/objects/Sky";
import * as THREE from "three";
import GUI from "lil-gui";
import cloud_vert from './cloud_vert.glsl';
import cloud_frag from './cloud_frag.glsl';
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

function loadGLB(scene: THREE.Scene) {
  const loader = new GLTFLoader();
    const draco = new DRACOLoader();
    draco.setDecoderPath("./assets/libs/draco/");
    loader.setDRACOLoader(draco);
    loader.load("./assets/models/modern_office/scene.glb", (result: GLTF) => {
      result.scene.position.add(new THREE.Vector3(0, 100, 0))
      scene.add(result.scene);
    });
}

function initScene(
  scene: THREE.Scene,
  camera: THREE.Camera,
  renderer: THREE.WebGLRenderer
) {
  // add light
  const ambientLight = new THREE.AmbientLight("#ffffff", 0.5);
  scene.add(ambientLight);

  // add box
  scene.add(
    new THREE.Mesh(new THREE.BoxGeometry(2, 500), new THREE.MeshBasicMaterial())
  );

  loadGLB(scene);

  const gridHelper = new THREE.GridHelper(10000, 30, 0x2c2c2c, 0x888888);
  scene.add(gridHelper);

  // add sky
  const sky = new Sky();
  sky.scale.setScalar(500000);
  const skyUniforms = sky.material.uniforms;
  skyUniforms["turbidity"].value = 10;
  skyUniforms["rayleigh"].value = 2;
  skyUniforms["mieCoefficient"].value = 0.005;
  skyUniforms["mieDirectionalG"].value = 0.8;
  const parameters = {
    elevation: 2,
    azimuth: 180,
  };
  const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
  const theta = THREE.MathUtils.degToRad(parameters.azimuth);
  const sun = new THREE.Vector3();
  sun.setFromSphericalCoords(1, phi, theta);
  sky.material.uniforms["sunPosition"].value.copy(sun);

  // set sky environment
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const sceneEnv = new THREE.Scene();
  sceneEnv.add(sky);
  let renderTarget = pmremGenerator.fromScene(sceneEnv);
  scene.environment = renderTarget.texture;

  // add sky
  sky.renderOrder = -2;
  scene.add(sky);

  // 更新太阳位置
  function updateSun() {
    const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
    const theta = THREE.MathUtils.degToRad(parameters.azimuth);

    const sun = new THREE.Vector3();
    sun.setFromSphericalCoords(1, phi, theta);

    sky.material.uniforms["sunPosition"].value.copy(sun);

    if (renderTarget !== undefined) renderTarget.dispose();

    sceneEnv.add(sky);
    renderTarget = pmremGenerator.fromScene(sceneEnv);
    scene.add(sky);

    scene.environment = renderTarget.texture;
  }

  // set toneMapping
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.5;

  return {
    sky,
    sceneEnv,
    pmremGenerator,
    parameters,
    updateSun,
  };
}

function initCloud(
  scene: THREE.Scene,
  camera: THREE.Camera,
  renderer: THREE.WebGLRenderer
) {
  const cloudGeom = new THREE.SphereGeometry(
    1000,
    32,
    8,
    0,
    Math.PI * 2,
    0,
    Math.PI * 0.5
  );
  const cloudMaterial = new THREE.ShaderMaterial({
    uniforms: {
      iResolution: {
        value: new THREE.Vector3(window.innerWidth, window.innerHeight),
      },
      iTime: {
        value: 1,
      },
      iMouse: {
        value: new THREE.Vector2(),
      },
      iChannel0: {
        value: null,
      },
      uCOVERAGE: {
        value: .5
      },
      uTHICKNESS: {
        value: 15.
      },
      uABSORPTION: {
        value: 1.030725
      },
      uWIND: {
        value: new THREE.Vector3(0, 0, -0.2)
      },
      uFBM_FREQ: {
        value: 2.76434
      },
      uCLOUD_OPACITY: {
        value: 0.15
      }
    },
    vertexShader: cloud_vert,
    fragmentShader: cloud_frag,
  });
  cloudMaterial.side = THREE.DoubleSide;
  cloudMaterial.transparent = true;
  const cloud = new THREE.Mesh(cloudGeom, cloudMaterial);
  scene.add(cloud);

  function updateCloudsParams(delta?: number) {
    cloudMaterial.uniforms.iTime.value = (delta ?? 1) * 0.001;
  }

  return {
    updateCloudsParams,
    cloudMaterial
  };
}

function DynamicCloudPage() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const domElement = container.current;


    const appParams = {
      toneMappingExposure: 1.0,
      uCOVERAGE: 0.5,
      uTHICKNESS: 15.0,
      uABSORPTION: 1.030725,
      uWIND_X: 0.0,
      uWIND_Z: -0.2,
      uFBM_FREQ: 2.76434,
      uCLOUD_OPACITY: 0.15
    }


    const { renderer, scene, camera, controls } = initTHREE();
    if (domElement) {
      domElement.appendChild(renderer.domElement);
    }
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    const {
      parameters,
      updateSun,
    } = initScene(scene, camera, renderer);

    const { updateCloudsParams, cloudMaterial } = initCloud(scene, camera, renderer);

    // 设置曝光度
    renderer.toneMappingExposure = appParams.toneMappingExposure;

    camera.position.set(0, 1000, 1000);
    controls.update();

    const gui = new GUI();
    gui.add(document, "title");
    const folderSky = gui.addFolder("Sky");
    folderSky.add(parameters, "elevation", 0, 90, 0.1).onChange(updateSun);
    folderSky.add(parameters, "azimuth", -180, 180, 0.1).onChange(updateSun);
    folderSky.add(parameters, "azimuth", -180, 180, 0.1).onChange(updateSun);

    folderSky.add(appParams, 'toneMappingExposure', 0, 5).onChange(()=>{
      renderer.toneMappingExposure = appParams.toneMappingExposure;
    })
    folderSky.add(appParams, 'uCOVERAGE', 0, 1).onChange(()=>{
      cloudMaterial.uniforms.uCOVERAGE.value = appParams.uCOVERAGE
    })
    folderSky.add(appParams, 'uWIND_X', -1, 1).onChange(()=>{
      cloudMaterial.uniforms.uWIND.value.x = appParams.uWIND_X
    })
    folderSky.add(appParams, 'uWIND_Z', -1, 1).onChange(()=>{
      cloudMaterial.uniforms.uWIND.value.z = appParams.uWIND_Z
    })
    folderSky.add(appParams, 'uCLOUD_OPACITY', 0, 1).onChange(()=>{
      cloudMaterial.uniforms.uCLOUD_OPACITY.value = appParams.uCLOUD_OPACITY
    })
    folderSky.add(appParams, 'uTHICKNESS', 0, 30).onChange(()=>{
      cloudMaterial.uniforms.uTHICKNESS.value = appParams.uTHICKNESS
    })
    folderSky.add(appParams, 'uABSORPTION', 0, 5).onChange(()=>{
      cloudMaterial.uniforms.uABSORPTION.value = appParams.uABSORPTION
    })
    folderSky.add(appParams, 'uFBM_FREQ', 0, 5).onChange(()=>{
      cloudMaterial.uniforms.uFBM_FREQ.value = appParams.uFBM_FREQ
    })

    folderSky.open();

    function loop(delta?: number) {
      resizeRendererToParent(renderer, camera);

      updateCloudsParams(delta);

      renderer.render(scene, camera);

      requestAnimationFrame(loop);
    }
    loop();

    return () => {
      domElement?.removeChild(renderer.domElement);
      renderer.dispose();
      gui.destroy();
    };
  }, []);

  return (
    <div>
      <div className={classNames(["w-full", "h-full"])} ref={container} />
    </div>
  );
}

export { DynamicCloudPage };
