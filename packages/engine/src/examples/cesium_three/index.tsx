/* eslint-disable no-inner-declarations */
import { useEffect, useRef } from "react";
import { initCesium } from "./index";
import { Viewer } from "cesium";
import classNames from "classnames";
import { initTHREE } from "../helper";
import * as THREE from "three";
import GUI from "lil-gui";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

function CesiumPage() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cesiumViewer: Viewer;
    let threeRenderer: THREE.WebGLRenderer;
    if (container.current) {
      const {
        viewer,
        getCesiumColorTexture,
        getCesiumDepthTexture,
        updateCesium,
        updateCesiumCameraWithThree,
      } = initCesium("CesiumContainer");
      cesiumViewer = viewer;

      const { scene, renderer, camera, controls } = initTHREE(viewer.canvas);
      threeRenderer = renderer;

      const customMaterial = new THREE.ShaderMaterial({
        uniforms: {
          czmSceneColor: {
            value: undefined,
          },
          czmSceneDepth: {
            value: undefined,
          },
        },
        vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, -.041, 1.0);
        }
        `,
        fragmentShader: `
        uniform sampler2D czmSceneColor;
        uniform sampler2D czmSceneDepth;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        float czm_unpackDepth(vec4 packedDepth)
        {
           // See Aras Pranckevičius' post Encoding Floats to RGBA
           // http://aras-p.info/blog/2009/07/30/encoding-floats-to-rgba-the-final/
           return dot(packedDepth, vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0));
        }

        void main() {
          vec4 color = texture2D(czmSceneColor, vUv);

          float depth = czm_unpackDepth(texture2D(czmSceneDepth, vUv));

          gl_FragColor = color;
          gl_FragDepthEXT = depth;

        }
        `,
      });

      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2, 1, 1),
        customMaterial
      );
      mesh.frustumCulled = false;
      mesh.renderOrder = -1;
      scene.add(mesh);

      const boxMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.8),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0, 0) })
      );
      boxMesh.position.setX(50);
      scene.add(boxMesh);

      const boxMesh2 = new THREE.Mesh(
        new THREE.SphereGeometry(3),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(0, 1, 0) })
      );
      boxMesh2.position.set(0.5, 0.0, 0.0);
      scene.add(boxMesh2);

      scene.add(new THREE.GridHelper(100));
      camera.position.x = 10;
      camera.position.z = 10;
      camera.position.y = 10;

      scene.add(new THREE.AmbientLight(new THREE.Color(1.0, 1.0, 1.0), 5.0));
      scene.add(new THREE.DirectionalLight(new THREE.Color(1.0, 1.0, 1.0)))

      function initCZMColor() {
        const colorTexture = getCesiumColorTexture();
        if (colorTexture && colorTexture._texture) {
          const texProps = renderer.properties.get(colorTexture._texture);
          texProps.__webglTexture = colorTexture._texture;
          customMaterial.uniforms.czmSceneColor = {
            value: colorTexture._texture,
          };
        }
        const depthTexture = getCesiumDepthTexture();
        if (depthTexture && depthTexture._texture) {
          const texProps = renderer.properties.get(depthTexture._texture);
          texProps.__webglTexture = depthTexture._texture;
          customMaterial.uniforms.czmSceneDepth = {
            value: depthTexture._texture,
          };
        }
        customMaterial.needsUpdate = true;
      }

      function resetGLState() {
        const gl = renderer.getContext();
        if (gl) {
          (gl as WebGL2RenderingContext).bindVertexArray(null);
        }
      }

      function renderTHREEScene() {
        renderer.resetState();
        renderer.render(scene, camera);
        resetGLState();
      }

      const gui = new GUI();
      gui.add(document, "title");
      const cameraConfig = gui.addFolder("camera");
      cameraConfig.add(camera.position, "x", -1000, 1000, 0.1);
      cameraConfig.add(camera.position, "y", -1000, 1000, 0.1);
      cameraConfig.add(camera.position, "z", -1000, 1000, 0.1);

      // add gltf
      const loader = new GLTFLoader();
      const draco = new DRACOLoader();
      let model;
      draco.setDecoderPath("http://localhost:5173/assets/libs/draco/");
      loader.setDRACOLoader(draco);
      loader.load(
        "http://localhost:5173/assets/models/8.glb",
        (result: GLTF) => {
          scene.add(result.scene);
          model = result.scene;

          const modelConfig = gui.addFolder("模型")
          modelConfig.add(model.position, "x", -500, 500, 0.1);
          modelConfig.add(model.position, "y", -500, 500, 0.1);
          modelConfig.add(model.position, "z", -500, 500, 0.1);
        }
      );

      function loop() {
        if (!cesiumViewer.isDestroyed()) {
          controls.update();

          updateCesiumCameraWithThree(camera);

          updateCesium();

          initCZMColor();

          renderTHREEScene();

          requestAnimationFrame(loop);
        }
      }
      loop();
    }

    return () => {
      cesiumViewer && cesiumViewer.destroy();
      threeRenderer && threeRenderer.dispose();
    };
  }, []);

  return (
    <>
      <div
        className={classNames(["w-full", "h-full"])}
        id="CesiumContainer"
        ref={container}
      />
    </>
  );
}

export default CesiumPage;
