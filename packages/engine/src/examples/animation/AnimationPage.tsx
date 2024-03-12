import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Select } from "antd";
import classNames from "classnames";
import InstantiateHelper from "../../engine/instanced-model";

export default function AnimationPage() {
  const container = useRef<HTMLDivElement>(null);

  const [animationItems, setAnimationItems] = useState<
    {
      label: string;
      value: string;
      action: THREE.AnimationAction;
      pausedAt: number;
    }[]
  >([]);

  const [mixer, setMixer] = useState<THREE.AnimationMixer>();

  const [selectedKey, setSelectedKey] = useState<string>();

  useEffect(() => {
    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      1,
      200
    );

    camera.position.z = 50;

    /**
     * Scene
     */

    const scene = new THREE.Scene();

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
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    /**
     * Renderer
     */
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.render(scene, camera);

    const mixer = new THREE.AnimationMixer(new THREE.Group());
    setMixer(mixer);

    const clock = new THREE.Clock();

    function tick(): void {
      mixer.update(clock.getDelta());

      renderer.render(scene, camera);
      window.requestAnimationFrame(tick);
    }

    tick();

    if (container.current) {
      container.current.appendChild(renderer.domElement);
    }

    const loader = new GLTFLoader();
    const draco = new DRACOLoader();
    draco.setDecoderPath("./assets/libs/draco/");
    loader.setDRACOLoader(draco);
    loader.load("./assets/models/Soldier.glb", (result: GLTF) => {
      mixer.getRoot().add(result.scene);
      const animations: {
        action: THREE.AnimationAction;
        label: string;
        value: string;
        pausedAt: number;
      }[] = [];
      result.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        animations.push({
          action,
          label: clip.name,
          value: clip.name,
          pausedAt: 0,
        });
      });

      scene.add(result.scene);

      setAnimationItems(animations);
      if (animations.length) {
        setSelectedKey(animations[0].value);
      }

      // const instancedGroup = new THREE.Group();
      // for (let i = 0; i < 100; ++i) {
      //   const clonedScene = result.scene.clone();
      //   clonedScene.position.set(i * 10, 0, 0);
      //   instancedGroup.children.push(clonedScene);
      // }

      // const helper = new InstantiateHelper(instancedGroup);
      // helper.instantiate();
      // scene.add(helper.object);
    });

    const div = container.current;
    return () => {
      div?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [setMixer]);

  const handleChange = (value: string) => {
    console.log(`selected ${value}`);
    setSelectedKey(value);
  };

  const onPlay = () => {
    const item = animationItems.find((item) => item.value === selectedKey);
    if (item) {
      if (item.action.paused) {
        item.action.paused = false
      } else {
        item.action.play()
      }
    }
  };

  const onPause = () => {
    const item = animationItems.find((item) => item.value === selectedKey);
    if (item) {
      if (!item.action.paused) {
        item.action.paused = true;
      }
    }
  };

  const onStop = () => {
    const item = animationItems.find((item) => item.value === selectedKey);
    if (item) {
      item.action.stop();
    }
  };

  return (
    <div>
      <Select
        defaultValue={selectedKey}
        style={{ width: 120 }}
        onChange={handleChange}
        options={animationItems}
      />
      <button className={classNames(["m-2"])} type="button" onClick={onPlay}>
        play
      </button>
      <button className={classNames(["m-2"])} type="button" onClick={onPause}>
        pause
      </button>
      <button className={classNames(["m-2"])} type="button" onClick={onStop}>
        stop
      </button>
      <div ref={container} />
    </div>
  );
}
