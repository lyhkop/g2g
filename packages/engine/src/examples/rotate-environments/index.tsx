import classNames from "classnames";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { initTHREE, resizeRendererToParent } from "../helper";
import GUI from "lil-gui";
import { SphereGeometry } from "cesium";

function createEnvironments(renderer: THREE.WebGLRenderer) {
  // const pmrem = new THREE.PMREMGenerator(renderer);

  const fbo = new THREE.WebGLCubeRenderTarget(256);
  fbo.texture.type = THREE.HalfFloatType;
  const cubeCamera = new THREE.CubeCamera(1, 1000, fbo);

  const scene = new THREE.Scene();
  const geometry = new THREE.SphereGeometry();
  const material = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 1.0,
    side: THREE.BackSide,
    toneMapped: false,
  });
  const loader = new RGBELoader();
  loader
    .loadAsync(
      "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/peppermint_powerplant_2_1k.hdr"
    )
    .then((result) => {
      material.map = result;
      material.needsUpdate = true;
      cubeCamera.update(renderer, scene);
    });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.scale.set(100, 100, 100);
  scene.background = new THREE.Color(0, 0, 0);
  scene.add(mesh);

  // pmrem.fromScene(scene);

  cubeCamera.update(renderer, scene);

  const update = (rotation: THREE.Vector3, intensity: number) => {
    mesh.rotation.set(rotation.x, rotation.y, rotation.z);
    material.opacity = intensity
    cubeCamera.update(renderer, scene);
  };

  return {
    fbo,
    update,
  };
}

export function RotateEnvironmentsPage() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const domElement = container.current;
    const { renderer, scene, camera, controls } = initTHREE();
    camera.position.z = 5
    if (domElement) {
      domElement.appendChild(renderer.domElement);
    }

    const mesh = new THREE.Mesh(new THREE.SphereGeometry(), new THREE.MeshStandardMaterial())
    scene.add(mesh)

    const { fbo, update } = createEnvironments(renderer);
    scene.environment = fbo.texture;
    scene.background = fbo.texture;

    const appParams = {
      background: true,
      x: 0,
      y: 0,
      z: 0,
      blur: 0,
      intensity: 1,
    };

    const updateApp = () => {
      update(
        new THREE.Vector3(
          appParams.x * THREE.MathUtils.DEG2RAD,
          appParams.y * THREE.MathUtils.DEG2RAD,
          appParams.z * THREE.MathUtils.DEG2RAD
        ),
        appParams.intensity
      );

      scene.backgroundBlurriness = appParams.blur;
      scene.backgroundIntensity = appParams.intensity;
    };

    const gui = new GUI();
    gui.add(document, "title");
    const folder = gui.addFolder("folder");
    folder.add(appParams, "background").onChange(updateApp);
    folder.add(appParams, "x", -180, 180, 0.1).onChange(updateApp);
    folder.add(appParams, "y", -180, 180, 0.1).onChange(updateApp);
    folder.add(appParams, "z", -180, 180, 0.1).onChange(updateApp);
    folder.add(appParams, "blur", 0, 1, 0.1).onChange(updateApp);
    folder.add(appParams, "intensity", 0, 5, 0.1).onChange(updateApp);
    folder.open();

    function loop(delta?: number) {
      resizeRendererToParent(renderer, camera);

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
