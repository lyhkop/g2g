import { isNil } from "lodash-es";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

function initThree() {
  /**
   * camera
   */
  const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  );
  camera.position.set(0, 0, 0);
  camera.position.z = 50;
  camera.up.set(0, 0, 1);
  camera.lookAt(new THREE.Vector3(0, 1, 0));

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
  // controls.enabled = false

  return {
    scene,
    camera,
    controls,
    renderer,
  };
}

function init() {
  const { scene, camera, controls, renderer } = initThree();
  const size = 10;
  const divisions = 10;
  const gridHelper = new THREE.GridHelper(size, divisions);
  gridHelper.rotateX(-90 * THREE.MathUtils.DEG2RAD)
  scene.add(gridHelper);

  // scene.add(
  //   new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial())
  // );

  const socket = new WebSocket("ws://localhost:8001");

  const meshMap: Map<string, THREE.Mesh> = new Map()

  // Connection opened
  socket.addEventListener("open", function (event) {
    socket.send("Hello Server!");
  });

  const message = []

  // Listen for messages
  socket.addEventListener("message", function (event) {
    // console.log("Message from server ", event.data);
    const { type, data, name, matrix } = JSON.parse(event.data);
    if (type === "view_matrix") {
      const matrix = new THREE.Matrix4();
      matrix.set(
        data[0][0],
        data[0][1],
        data[0][2],
        data[0][3],
        data[1][0],
        data[1][1],
        data[1][2],
        data[1][3],
        data[2][0],
        data[2][1],
        data[2][2],
        data[2][3],
        data[3][0],
        data[3][1],
        data[3][2],
        data[3][3]
      );
      // matrix.transpose();
      matrix.invert();
      // console.log(matrix);

      const t = new THREE.Vector3();
      const q = new THREE.Quaternion();
      const s = new THREE.Vector3();
      matrix.decompose(t, q, s);

      const r = new THREE.Euler();
      r.setFromQuaternion(q);
      camera.position.set(t.x, t.y, t.z);
      camera.rotation.set(r.x, r.y, r.z);
      // camera.updateMatrixWorld();

      renderer.render(scene, camera)
    } else if (type === "geometry") {
      if (!meshMap.has(name)) {
        const mesh = new THREE.Mesh()
        meshMap.set(name, mesh)
        scene.add(mesh)
      }

      const mesh = meshMap.get(name)
      if (mesh) {
        const {geometry, material} = mesh
        
        if (data.vertices) {
          if (!geometry.hasAttribute('position')) {
            const positions = new Float32Array(data.vertices.flat());
            const positionAttribute = new THREE.BufferAttribute(positions, 3);
            geometry.setAttribute('position', positionAttribute)
          } else {
            data.vertices.forEach((vertex: number[], i: number)=>{
              geometry.getAttribute('position').setXYZ(i, vertex[0], vertex[1], vertex[2])
            })
            geometry.getAttribute('position').needsUpdate = true
          }
        }
        if (geometry.index && data.indices) {
          geometry.index.copyArray(data.indices.flat())
          geometry.index.needsUpdate = true
        } else {
          const indices = new Uint16Array(data.indices.flat());
          const a = new THREE.Uint16BufferAttribute(indices, 1)
          geometry.setIndex(a);
        }

        console.log(performance.now())

        const local_matrix = new THREE.Matrix4()
        local_matrix.fromArray(matrix.flat());
        mesh.matrix.copy(local_matrix.transpose())
        mesh.matrixAutoUpdate  = false
        mesh.updateMatrixWorld(true)
      }

      // message.push({
      //   type,
      //   name,
      //   data
      // })

      renderer.render(scene, camera)
    }
  });

  return {
    scene,
    renderer,
    camera,
    controls,
  };
}

function ConnectBlender() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { scene, renderer, camera } = init();

    function tick(): void {
      renderer.render(scene, camera);
      window.requestAnimationFrame(tick);
    }
    tick();

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
      <button
        onClick={() => {
          init();
        }}
      >
        连接Blender
      </button>
      <div ref={container} />
    </>
  );
}

export default ConnectBlender;
