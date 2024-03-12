/* eslint-disable no-inner-declarations */
import { useEffect, useRef } from "react";
import classNames from "classnames";
import { initTHREE } from "../helper";
import * as THREE from "three";
import GUI from "lil-gui";
import { Axes } from "./axes";


function AXesHelperPage() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const domElement = container.current;

    const { scene, renderer, camera, controls } = initTHREE();

    if (domElement) {
      domElement.appendChild(renderer.domElement);
    }

    const object3d = new THREE.Object3D();
    object3d.add(new Axes());
    const c = new THREE.PerspectiveCamera(50, 1, 1, 10)
    object3d.add(new THREE.CameraHelper(c))
    scene.add(object3d);

    scene.add(new THREE.GridHelper(100));
    scene.add(new THREE.AxesHelper(100))
    camera.position.x = 10;
    camera.position.z = 10;
    camera.position.y = 10;
    controls.update();

    function resizeRendererToDisplaySize(renderer: THREE.WebGLRenderer) {
      const canvas = renderer.domElement;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const needResize = canvas.width !== width || canvas.height !== height;
      if (needResize) {
        renderer.setSize(width, height, false);
      }

      return needResize;
    }

    const gui = new GUI();
    gui.add(document, "title");
    gui.add(object3d.position, "x", -10, 10);
    gui.add(object3d.position, "y", -10, 10);
    gui.add(object3d.position, "z", -10, 10);

    const rotation = {
      x: object3d.rotation.x,
      y: object3d.rotation.y,
      z: object3d.rotation.z,
    };
    gui.add(rotation, "x", 0, 360).onChange((v: number) => {
      object3d.rotation.x = v * THREE.MathUtils.DEG2RAD;
    });
    gui.add(rotation, "y", 0, 360).onChange((v: number) => {
      object3d.rotation.y = v * THREE.MathUtils.DEG2RAD;
    });
    gui.add(rotation, "z", 0, 360).onChange((v: number) => {
      object3d.rotation.z = v * THREE.MathUtils.DEG2RAD;
    });

    function loop(now: number) {
      if (resizeRendererToDisplaySize(renderer)) {
        const size = new THREE.Vector2();
        renderer.getDrawingBufferSize(size);
        camera.aspect = size.width / size.height;
        camera.updateProjectionMatrix();
      }

      renderer.render(scene, camera);

      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    return () => {
      domElement?.removeChild(renderer.domElement);
      renderer.dispose();
      gui.destroy();
    };
  }, []);

  return (
    <>
      <div className={classNames(["w-full", "h-full"])} ref={container} />
    </>
  );
}

export default AXesHelperPage;
