/* eslint-disable no-inner-declarations */
import { useEffect, useRef } from "react";
import classNames from "classnames";
import { initTHREE } from "../helper";
import * as THREE from "three";
import GUI from "lil-gui";

const heatMapMaterial = new THREE.ShaderMaterial({
  uniforms: {},
  vertexShader: `
  out vec3 vWorldPosition;
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  }
  `,
  fragmentShader: `  
in vec3 vWorldPosition;

const float HEAT_MAX = 100.;
const float PointRadius = 4.2;

// test data
const int PointCount = 18;
const vec3 Points[] = vec3[](
    vec3(0., 0., 10.),
    vec3(.2, .6, 5.),
    vec3(.25, .7, 8.),
    vec3(.33, .9, 5.),
    vec3(.35, .8, 6.),
    vec3(.1, .1, 6.),
    vec3(-.45, .8, 4.),
    vec3(-.2, -.6, 5.),
    vec3(-.25, -.7, 8.),
    vec3(-.33, -.9, 8.),
    vec3(.35, -.45, 10.),
    vec3(-.1, -.8, 10.),
    vec3(.33, -.3, 5.),
    vec3(-.35, .75, 6.),
    vec3(.6, .4, 10.),
    vec3(-.4, -.8, 4.),
    vec3(.7, -.3, 6.),
    vec3(.3, -.8, 8.)
);

vec3 gradient(float w, vec2 uv) {
    w = pow(clamp(w, 0., 1.) * 3.14159 * .5, .9);
    vec3 c = vec3(sin(w), sin(w * 2.), cos(w)) * 1.1;
    return mix(vec3(0.0), c, w);
}
  void main() {

    vec2 uv = vWorldPosition.xz;

    float d = 0.;
    for (int i = 0; i < PointCount; i++) {
        vec3 v = Points[i] * 10.0;
        float intensity = 1.0;
        float pd = (1. - length(uv - v.xy) / PointRadius) * intensity;
        d += pow(max(0., pd), 2.);
    }

    vec4 fragColor = vec4(gradient(d, uv), 1.);

    gl_FragColor = fragColor;
  }
  `
})

function HeatMapPage() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const domElement = container.current;

    const { scene, renderer, camera, controls } = initTHREE();

    if (domElement) {
      domElement.appendChild(renderer.domElement);
    }

    const heatmapPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 50),
      heatMapMaterial
    );
    heatmapPlane.rotateX(-90 * THREE.MathUtils.DEG2RAD);
    scene.add(heatmapPlane);

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

export default HeatMapPage;
