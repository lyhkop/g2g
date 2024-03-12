import React, { useEffect, useRef } from "react";
import { init } from "./viewer";
import * as THREE from "three";
import { FolderApi, Pane } from "tweakpane";
import * as EssentialsPlugin from "@tweakpane/plugin-essentials";
import * as TweakpaneImagePlugin from "@kitschpatrol/tweakpane-image-plugin";

import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ProjectedMaterial } from "./material/ProjectedMaterial";

async function initDemo(scene: THREE.Scene) {

  const video = document.createElement('video')
  video.src = './assets/videos/bigbucksbunny.mp4'
  video.muted = true
  video.loop = true
  video.play()

  const texture = new THREE.VideoTexture(video)

  const loader = new GLTFLoader();
  const draco = new DRACOLoader();
  draco.setDecoderPath("./assets/libs/draco/");
  loader.setDRACOLoader(draco);
  const gltf = await loader.loadAsync('./assets/models/cinema_screen.glb')
  const cinemaModel = gltf.scene
  // model is in linear color space
  cinemaModel.traverse((child) => {
    // if (child.isMesh) {
    //   if (child.material.map) {
    //     child.material.map.encoding = THREE.LinearEncoding
    //   }
    //   if (child.material.color.getHexString() !== 'ffffff') {
    //     child.material.color.convertLinearToSRGB()
    //   }
    // }
  })
  cinemaModel.scale.setScalar(0.1)
  scene.add(cinemaModel);

  const projector = new THREE.PerspectiveCamera(30, 16 / 9, 0.01, 2)
  projector.position.set(0, 0.55, 1.52)
  const helper = new THREE.CameraHelper(projector)
  scene.add(helper)

  const material = new ProjectedMaterial({
    camera: projector,
    texture,
    color: '#aaa', // the color of the remaining screen
  })

  let screen!: THREE.Mesh
  cinemaModel.traverse((child) => {
    if (child.name === 'screen') {
      screen = child as THREE.Mesh
    }
  })
  if (screen !== null) {
    (screen as THREE.Mesh).material = material as any
    // everything is set, project!
    material.project(screen)
  }

  return {
    projector,
    material,
    helper,
    screen
  }
}

function ProjectionMaterialDemo() {
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

    const promise = initDemo(scene)

    function tick(): void {
      renderer.render(scene, camera);

      controls.update();

      window.requestAnimationFrame(tick);
    }
    tick();

    const pane = new Pane();
    pane.registerPlugin(TweakpaneImagePlugin);
    pane.registerPlugin(EssentialsPlugin);


    promise.then(({projector, material, screen})=>{
      const projectionCameraFolder = pane.addFolder({
        title: '投影相机配置'
      })
      projectionCameraFolder.addBinding({position: {x: projector.position.x, y: projector.position.y, z: projector.position.z}}, 'position').on('change', (ev)=>{
        projector.position.setX(ev.value.x)
        projector.position.setY(ev.value.y)
        projector.position.setZ(ev.value.z)
        material.project(screen as any)
      })
      projectionCameraFolder.addBinding({rotation: {x: projector.rotation.x, y: projector.rotation.y, z: projector.rotation.z}}, 'rotation', {step: 0.01}).on('change', (ev)=>{
        projector.rotation.x = ev.value.x
        projector.rotation.y = ev.value.y
        projector.rotation.z = ev.value.z
        material.project(screen as any)
      })
    })


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

export { ProjectionMaterialDemo };
