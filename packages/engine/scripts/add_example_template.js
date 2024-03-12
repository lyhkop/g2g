import fs from "fs";
import { Command } from "commander";

const program = new Command();

program.version("0.0.1").option("-n, --name <n>").parse(process.argv);

const options = program.opts();
if (options.name) {
  const fileName = options.name;
  const templateContent = `
  /* eslint-disable no-inner-declarations */
  import { useEffect, useRef } from "react";
  import classNames from "classnames";
  import { initTHREE } from "../helper";
  import * as THREE from "three";
  import GUI from "lil-gui";
  
  function ${fileName}Page() {
    const container = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
      const domElement = container.current;
  
      const { scene, renderer, camera, controls } = initTHREE();
  
      if (domElement) {
        domElement.appendChild(renderer.domElement);
      }
  
      scene.add(new THREE.GridHelper(100));
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
  
      function loop(now: number) {
  
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
  
  export default ${fileName}Page;
    
  `;
  fs.promises
    .writeFile(`../src/examples/${fileName}.tsx`, templateContent)
    .then(() => {
      console.log("File created successfully.");
    })
    .catch((err) => {
      console.log("An error occurred while creating the file:", err);
    });
}
