import { useEffect, useRef } from "react";
import { init } from "./viewer";
import * as THREE from "three";
import { Pane } from "tweakpane";
import * as EssentialsPlugin from "@tweakpane/plugin-essentials";
import * as TweakpaneImagePlugin from "@kitschpatrol/tweakpane-image-plugin";

async function initDemo(scene: THREE.Scene) {
  const boxGeometry = new THREE.BoxGeometry();
  const mesh = new THREE.Mesh(
    boxGeometry,
    new THREE.MeshStandardMaterial({
      color: new THREE.Color("#60ACFC"),
      // side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
      depthWrite: false
    }),
  );
  mesh.scale.set(3, 3, 3);
  // mesh.position.setZ(10)

  scene.add(mesh);

  const mesh2 = new THREE.Mesh(
    boxGeometry,
    new THREE.MeshStandardMaterial({
      color: new THREE.Color("#60ACFC"),
      // side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
      depthWrite: false
    })
  );
  scene.add(mesh2);
}

function SubMeshDemo() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { scene, camera, controls, renderer } = init();
    if (container.current) {
      container.current.appendChild(renderer.domElement);
      renderer.setSize(
        container.current.clientWidth,
        container.current.clientHeight
      );
    }

    scene.add(new THREE.GridHelper());
    scene.add(new THREE.AmbientLight());

    const promise = initDemo(scene);

    function tick(): void {
      renderer.render(scene, camera);

      controls.update();

      window.requestAnimationFrame(tick);
    }
    tick();

    const pane = new Pane();
    pane.registerPlugin(TweakpaneImagePlugin);
    pane.registerPlugin(EssentialsPlugin);

    return () => {
      container.current?.removeChild(renderer.domElement);
      renderer.dispose();
      pane.dispose();
    };
  }, [container]);

  return (
    <>
      <div ref={container} />
    </>
  );
}

export { SubMeshDemo };
