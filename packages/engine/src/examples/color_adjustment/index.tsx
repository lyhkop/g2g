/* eslint-disable no-inner-declarations */
import { useEffect, useRef } from "react";
import classNames from "classnames";
import { initTHREE } from "../helper";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass";
import GUI from "lil-gui";

const colorAdjustmentShader: THREE.Shader = {
  uniforms: {
    tDiffuse: { value: null },
    gamma: { value: 1 },
    saturation: { value: 1 },
    contrast: { value: 1 },
    brightness: { value: 1 },
    red: { value: 1 },
    green: { value: 1 },
    blue: { value: 1 },
    alpha: { value: 1 },
  },
  vertexShader: `
  varying vec2 vTextureCoord;

	void main() {

      vTextureCoord = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

	}
  `,
  fragmentShader: `
varying vec2 vTextureCoord;
uniform sampler2D tDiffuse;
uniform float gamma;
uniform float contrast;
uniform float saturation;
uniform float brightness;
uniform float red;
uniform float green;
uniform float blue;
uniform float alpha;

void main(void)
{
    vec4 c = texture2D(tDiffuse, vTextureCoord);

    if (c.a > 0.0) {
        c.rgb /= c.a;

        vec3 rgb = pow(c.rgb, vec3(1. / gamma));
        rgb = mix(vec3(.5), mix(vec3(dot(vec3(.2125, .7154, .0721), rgb)), rgb, saturation), contrast);
        rgb.r *= red;
        rgb.g *= green;
        rgb.b *= blue;
        c.rgb = rgb * brightness;

        c.rgb *= c.a;
    }

    gl_FragColor = c * alpha;
}
  `,
};

function ColorAdjustmentPage() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const domElement = container.current;

    const { scene, renderer, camera, controls } = initTHREE();

    if (domElement) {
      domElement.appendChild(renderer.domElement);
    }

    const boxMesh = new THREE.Mesh(
      new THREE.SphereGeometry(),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0, 0) })
    );
    scene.add(boxMesh);

    const boxMesh2 = new THREE.Mesh(
      new THREE.SphereGeometry(),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(0, 1, 0) })
    );
    boxMesh2.position.set(0.5, 0.0, 0.0);
    scene.add(boxMesh2);

    scene.add(new THREE.GridHelper(100));
    camera.position.x = 10;
    camera.position.z = 10;
    camera.position.y = 10;
    controls.update();

    // 后处理
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass); // color pass

    const colorAdjustmentPass = new ShaderPass(colorAdjustmentShader);
    composer.addPass(colorAdjustmentPass); // post pass

		const outputPass = new OutputPass();
		composer.addPass( outputPass ); // out pass

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
    gui.add( colorAdjustmentPass.uniforms.gamma, 'value', 0, 5 ).name( 'gamma' );
    gui.add( colorAdjustmentPass.uniforms.contrast, 'value', 0, 5 ).name( 'contrast' );
    gui.add( colorAdjustmentPass.uniforms.saturation, 'value', 0, 5 ).name( 'saturation' );
    gui.add( colorAdjustmentPass.uniforms.brightness, 'value', 0, 5 ).name( 'brightness' );
    gui.add( colorAdjustmentPass.uniforms.red, 'value', 0, 5 ).name( 'red' );
    gui.add( colorAdjustmentPass.uniforms.green, 'value', 0, 5 ).name( 'green' );
    gui.add( colorAdjustmentPass.uniforms.blue, 'value', 0, 5 ).name( 'blue' );
    gui.add( colorAdjustmentPass.uniforms.alpha, 'value', 0, 1 ).name( 'alpha' );

    let then = 0;
    function loop(now: number) {
      now *= 0.001; // convert to seconds
      const deltaTime = now - then;
      then = now;
      if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        composer.setSize(canvas.width, canvas.height);
      }

      composer.render(deltaTime);

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

export default ColorAdjustmentPage;
