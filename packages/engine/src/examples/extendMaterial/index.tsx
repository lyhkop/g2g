import React, { useEffect, useRef } from "react";
import { init } from "./viewer";
import { CustomMeshStanderMaterial } from "./customMaterial";
import * as THREE from "three";
import { FolderApi, Pane } from "tweakpane";
import * as EssentialsPlugin from "@tweakpane/plugin-essentials";
import * as TweakpaneImagePlugin from "@kitschpatrol/tweakpane-image-plugin";

function ExtendMaterialDemo() {
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

    const csm = new CustomMeshStanderMaterial({
      map: new THREE.Texture(),
    });

    const loadTexturePromise = new Promise((resolve) => {
      const loader = new THREE.TextureLoader();
      loader
        .loadAsync(
          "https://mdn.alipayobjects.com/mars/afts/img/A*9-KRRai8Ki4AAAAAAAAAAAAADlB4AQ/original"
        )
        .then((data) => {
          csm.map = data;
          csm.needsUpdate = true;
          resolve(true);
        });
    });

    const mesh = new THREE.Mesh(new THREE.BoxGeometry(), csm);
    scene.add(mesh);

    function tick(): void {
      renderer.render(scene, camera);

      controls.update();

      window.requestAnimationFrame(tick);
    }
    tick();

    const pane = new Pane();
    pane.registerPlugin(TweakpaneImagePlugin);
    pane.registerPlugin(EssentialsPlugin);

    const baseColorTextureFolder = pane.addFolder({
      title: "材质baseColorTexture参数",
    });

    loadTexturePromise.then(() => {
      const img0 = new Image();
      img0.src =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
      const img = csm.map?.image ?? img0;
      baseColorTextureFolder
        .addBinding({ map: img }, "map", {
          view: "input-image",
          imageFit: "contain",
          label: "纹理图片",
        })
        .on("change", (ev) => {
          const newImage = ev.value;

          newImage.onload = () => {
            csm.map = new THREE.Texture(newImage);
            csm.map.needsUpdate = true;
          };
        });
      baseColorTextureFolder
        .addBinding(
          { brightness: csm.uniforms.map_brightness.value },
          "brightness",
          {
            label: "亮度",
            min: 0,
            step: 0.1,
            max: 10,
          }
        )
        .on("change", (ev) => {
          csm.uniforms.map_brightness.value = ev.value;
        });
      baseColorTextureFolder
        .addBinding({ contrast: csm.uniforms.map_contrast.value }, "contrast", {
          label: "对比度",
          min: 0,
          step: 0.1,
          max: 10,
        })
        .on("change", (ev) => {
          csm.uniforms.map_contrast.value = ev.value;
        });
      baseColorTextureFolder
        .addBinding(
          { saturation: csm.uniforms.map_saturation.value },
          "saturation",
          {
            label: "饱和度",
            min: 0,
            step: 0.1,
            max: 10,
          }
        )
        .on("change", (ev) => {
          csm.uniforms.map_saturation.value = ev.value;
        });

      baseColorTextureFolder.addBinding({color: {
        r: csm.color.r,
        g: csm.color.g,
        b: csm.color.b
      }}, 'color', {
        color: {type: 'float'},
      }).on('change', (ev)=>{
        csm.color.r = ev.value.r
        csm.color.g = ev.value.g
        csm.color.b = ev.value.b
      })
    });

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

export { ExtendMaterialDemo };
