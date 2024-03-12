import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

import { extrudePolygon, extrudePolyline } from "./lib/geometry-extrude";
import { createNode, HTNode } from "./createNode";

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
  camera.position.z = 20;

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

  const renderScene = new RenderPass(scene, camera);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
  );
  bloomPass.threshold = 0.5;
  bloomPass.strength = 0.3;
  bloomPass.radius = 0.01;

  const outputPass = new OutputPass();

  const composer = new EffectComposer(renderer);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);
  composer.addPass(outputPass);

  composer.renderTarget1.samples = 4;
  composer.renderTarget2.samples = 4;
  composer.setPixelRatio(window.devicePixelRatio);

  return {
    scene,
    camera,
    controls,
    renderer,
    composer,
  };
}

function parseNodes(nodes: any, scene: THREE.Scene) {
  const group = new THREE.Group();

  nodes.forEach((node: HTNode, i: number) => {
    // if (i < 5 && i > 1) {
    const obj = createNode(node);
    group.add(obj);
    // }
  });

  // group.rotateX(Math.PI / 2)

  scene.add(group);
}

function extrudeTest(scene: THREE.Scene, json: any) {
  parseNodes(json.d, scene);
}

function ExtrudeShapeDemo() {
  const container = useRef<HTMLDivElement>(null);

  const [renderInfo, setRenderInfo] = useState({
    fps: 0,
    triangles: 0,
  });
  const [modelTriangles, setModelTriangles] = useState(0);

  useEffect(() => {
    const { scene, camera, controls, renderer, composer } = init();

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
    const ambientLight = new THREE.AmbientLight("#ffffff", 0.2);
    // scene.add(ambientLight);

    scene.add(new THREE.GridHelper());

    scene.add(new THREE.AxesHelper());

    fetch("./assets/models/data.json")
      .then((response) => {
        return response.json();
      })
      .then((json: any) => {
        extrudeTest(scene, json);
      });

    const directionalLight = new THREE.DirectionalLight(
      "#ffffff",
      0.8 /* , 0, 1 */
    );
    // scene.add(directionalLight);

    const lightTarget = new THREE.Object3D();
    scene.add(lightTarget);

    const headLight = new THREE.PointLight("#ffffff", 1, 0, 0);
    headLight.distance = 0;
    headLight.decay = 0;
    scene.add(headLight);

    camera.add(headLight);

    scene.add(camera);

    /**
     * loop
     */
    function tick(): void {
      // directionalLight.position.copy(camera.position);

      // const cameraDirection = camera.getWorldDirection(new THREE.Vector3());

      // lightTarget.position.copy(camera.position).add(cameraDirection);

      // directionalLight.target = lightTarget;

      // headLight.position.copy(camera.position);

      // renderer.render(scene, camera);

      composer.render();

      window.requestAnimationFrame(tick);
    }

    tick();

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
      <div ref={container} />
    </>
  );
}

export default ExtrudeShapeDemo;
