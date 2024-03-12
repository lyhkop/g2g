import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  BatchedParticleRenderer,
  Bezier,
  ColorOverLife,
  ConeEmitter,
  ConstantValue,
  EmitterShape,
  Gradient,
  IntervalValue,
  ParticleSystem,
  PiecewiseBezier,
  PointEmitter,
  RandomColor,
  RenderMode,
  SizeOverLife,
  SphereEmitter,
} from "../../libs/three.quarks/src";
import { BladeApi, FolderApi, Pane } from "tweakpane";
import * as EssentialsPlugin from "@tweakpane/plugin-essentials";
import * as TweakpaneImagePlugin from "@kitschpatrol/tweakpane-image-plugin";
import { addInput, addNumberInput } from "./utils";
import * as CustomInput from './custom_input'

async function createFire0() {
  const texture = await new THREE.TextureLoader().loadAsync(
    "https://mdn.alipayobjects.com/mars/afts/img/A*9-KRRai8Ki4AAAAAAAAAAAAADlB4AQ/original"
  );

  const texture2 = await new THREE.TextureLoader().loadAsync(
    "https://mdn.alipayobjects.com/mars/afts/img/A*Wn7gR64G0dIAAAAAAAAAAAAADlB4AQ/original"
  );

  const ps = new ParticleSystem({
    material: new THREE.MeshBasicMaterial({
      map: texture,
      blending: THREE.AdditiveBlending,
      transparent: true,
      side: THREE.DoubleSide,
    }),
    uTileCount: 2,
    vTileCount: 2,
    renderOrder: 2,

    // emitter
    shape: new ConeEmitter({
      radius: 0.1,
      angle: THREE.MathUtils.degToRad(10),
    }),
    emissionOverTime: new ConstantValue(20),

    // base config
    duration: 5,
    looping: true,
    startLife: new IntervalValue(1.2, 1.4),
    startSpeed: new IntervalValue(1, 1.4),
    startSize: new IntervalValue(0.4, 0.45),
    worldSpace: true,
  });
  ps.addBehavior(
    new ColorOverLife(
      new Gradient(
        [
          [new THREE.Vector3(0, 0, 0), 0],
          [new THREE.Vector3(1, 213 / 255, 99 / 255), 0.14],
          [new THREE.Vector3(1, 145 / 255, 55 / 255), 0.24],
          [new THREE.Vector3(1, 93 / 255, 21 / 255), 0.32],
          [new THREE.Vector3(1, 26 / 255, 0), 1.0],
        ],
        [
          [0, 0],
          [0.62, 0.14],
          [1, 0.24],
          [0.9, 0.32],
          [0.01, 1.0],
        ]
      )
    )
  );
  ps.addBehavior(
    new SizeOverLife(
      new PiecewiseBezier([[new Bezier(0.8, 0.95, 1.95, 2.5), 0]])
    )
  );
  ps.emitter.rotateX(THREE.MathUtils.degToRad(-90));

  const ps2 = new ParticleSystem({
    material: new THREE.MeshBasicMaterial({
      map: texture2,
      blending: THREE.AdditiveBlending,
      transparent: true,
      side: THREE.DoubleSide,
    }),
    uTileCount: 1,
    vTileCount: 1,
    renderOrder: 2,

    // emitter
    shape: new ConeEmitter({
      radius: 0.1,
      angle: THREE.MathUtils.degToRad(20),
    }),
    emissionOverTime: new ConstantValue(5),

    // base config
    duration: 5,
    looping: true,
    startLife: new IntervalValue(2, 2),
    startSpeed: new IntervalValue(1, 1.2),
    startSize: new IntervalValue(0.4, 0.4),
    worldSpace: true,
    startTileIndex: new ConstantValue(0),
  });
  ps2.addBehavior(
    new SizeOverLife(
      new PiecewiseBezier([[new Bezier(0.25, 0.35, 0.45, 0.5), 0]])
    )
  );
  ps2.addBehavior(
    new ColorOverLife(
      new Gradient(
        [
          [new THREE.Vector3(0, 0, 0), 0],
          [new THREE.Vector3(1, 213 / 255, 99 / 255), 0.14],
          [new THREE.Vector3(1, 145 / 255, 55 / 255), 0.24],
          [new THREE.Vector3(1, 93 / 255, 21 / 255), 0.32],
          [new THREE.Vector3(1, 26 / 255, 0), 1.0],
        ],
        [
          [0, 0],
          [0.62, 0.14],
          [1, 0.24],
          [0.9, 0.32],
          [0.01, 1.0],
        ]
      )
    )
  );
  ps2.emitter.rotateX(THREE.MathUtils.degToRad(-90));

  return [ps, ps2];
}

async function createFire1() {
  const ps = new ParticleSystem({
    material: new THREE.MeshBasicMaterial({
      blending: THREE.AdditiveBlending,
      transparent: true,
      side: THREE.DoubleSide,
    }),

    // emitter
    shape: new PointEmitter(),
    emissionBursts: [
      {
        time: 0,
        count: new IntervalValue(100, 150),
        cycle: 1,
        interval: 0,
        probability: 1,
      },
    ],

    // base config
    duration: 5,
    looping: true,
    startLife: new IntervalValue(1.2, 1.4),
    startSpeed: new IntervalValue(1, 1.4),
    startSize: new IntervalValue(0.4, 0.45),
    worldSpace: true,
  });

  return ps;
}

function bindingObject(pane: Pane, ps: ParticleSystem) {
  pane.children.forEach((child) => {
    pane.remove(child);
  });

  const folder = pane.addFolder({
    title: ps.name,
  });

  const baseFolder = folder.addFolder({
    title: "基础配置",
  });

  addNumberInput(baseFolder, ps, "duration", "持续时间");
  addNumberInput(baseFolder, ps, "looping", "循环播放");
  addInput(baseFolder, ps, "startLife", "粒子寿命");
  addInput(baseFolder, ps, "startSpeed", "粒子速度");
  addInput(baseFolder, ps, "startSize", "粒子大小");

  // baseFolder.addBinding(ps, 'startColor')

  addMaterialInput(baseFolder, ps);

  addEmitterInput(folder, ps)
}

function addMaterialInput(parentFolder: FolderApi, ps: ParticleSystem) {
  const img0 = new Image();
  img0.src =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
  const img = ps.texture?.image ?? img0;
  const materialParams = {
    map: img,
    transparent: ps.material.transparent,
    side: ps.material.side,
  };
  const materialFolder = parentFolder.addFolder({
    title: "材质属性",
  });
  materialFolder
    .addBinding(materialParams, "map", {
      view: "input-image",
      imageFit: "contain",
      label: "纹理图片",
    })
    .on("change", (ev) => {
      const newImage = ev.value;
      newImage.onload = () => {
        ps.texture = new THREE.Texture(newImage);
        ps.texture.needsUpdate = true;
      };
    });
  materialFolder
    .addBinding(materialParams, "transparent", {
      label: "是否透明",
    })
    .on("change", (ev) => {
      ps.material.transparent = ev.value;
      ps.material.needsUpdate = true
    });

  materialFolder
    .addBinding({ value: { x: ps.uTileCount, y: ps.vTileCount } }, "value", {
      label: "纹理图集",
      step: 1,
    })
    .on("change", (ev) => {
      ps.uTileCount = ev.value.x;
      ps.vTileCount = ev.value.y;
    });
}

enum ShapeType {
  POINT = 'point',
  SPHERE = 'sphere',
  CONE = 'cone',
  CIRCLE = 'circle',
  GRID = 'grid'
}

function getShapeType(shape: EmitterShape): ShapeType {
  return shape.type as ShapeType
}

function addEmitterInput(parentFolder: FolderApi, ps: ParticleSystem) {
  const emitterFolder = parentFolder.addFolder({
    title: "发射器配置",
  });

  addInput(emitterFolder, ps, 'emissionOverTime', '每秒发射粒子数')

  emitterFolder.addFolder({title: '爆发配置'})


  const emitterShapeInput = emitterFolder.addFolder({title: '形状'})

  const {emitterShape} = ps
  const shapeType = getShapeType(emitterShape)
  const shapeTypeInput = emitterShapeInput.addBlade({
    view: "list",
    label: "类型",
    options: [
      { text: "点", value: ShapeType.POINT },
      { text: "球体", value: ShapeType.SPHERE },
      { text: "锥体", value: ShapeType.CONE },
      { text: "圆", value: ShapeType.CIRCLE },
      { text: "网格", value: ShapeType.GRID },
    ],
    value: shapeType,
  });

  emitterShapeInput.addBinding({position: {x: 0, y: 0, z: 0}}, 'position', {label: '位置'}).on('change', (ev)=>{
    ps.emitter.position.x = ev.value.x
    ps.emitter.position.y = ev.value.y
    ps.emitter.position.z = ev.value.z
  })
  emitterShapeInput.addBinding({rotation: {x: 0, y: 0, z: 0}}, 'rotation', {label: '旋转'}).on('change', (ev)=>{
    ps.emitter.rotation.x = ev.value.x
    ps.emitter.rotation.y = ev.value.y
    ps.emitter.rotation.z = ev.value.z
  })

  let shapeInput: BladeApi[]= []

  const handleValueTypeChange = (shapeType: ShapeType) => {
    shapeInput.forEach(a=>{emitterFolder.remove(a)})
    shapeInput = []

    switch (shapeType) {
      case ShapeType.POINT:
        break;
      case ShapeType.SPHERE:
        {
          const sphereEmitter = emitterShape as SphereEmitter
        
          let input = emitterShapeInput.addBinding(sphereEmitter, 'radius', {label: '半径'}).on('change', (ev)=>{
            sphereEmitter.radius = ev.value
          })
          shapeInput.push(input)
        }


        break;

      case ShapeType.CONE:
        {
          const coneEmitter = emitterShape as ConeEmitter

          let input = emitterShapeInput.addBinding(coneEmitter, 'radius', {label: '半径'}).on('change', (ev)=>{
            coneEmitter.radius = ev.value
          })
          shapeInput.push(input)


          input = emitterShapeInput.addBinding({ angle: coneEmitter.angle * THREE.MathUtils.RAD2DEG}, 'angle', {label: '立体角'}).on('change', (ev)=>{
            coneEmitter.angle = ev.value * THREE.MathUtils.DEG2RAD
          })
          shapeInput.push(input)

          input = emitterShapeInput.addBinding(coneEmitter, 'thickness', {label: '厚度'}).on('change', (ev)=>{
            coneEmitter.thickness = ev.value
          })
          shapeInput.push(input)

          const {valueTypeInput, valueInput} = addInput(emitterShapeInput, coneEmitter, 'speed', '发射速度')
          shapeInput.push(valueTypeInput)
          shapeInput.push(valueInput!)

        }


        break;
    }
  };

  handleValueTypeChange(shapeType);

  (shapeTypeInput as any).on('change', (ev: any)=>{ 
    handleValueTypeChange(ev.value)
  })


}

export function Particle_Demo() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pane = new Pane();
    pane.registerPlugin(TweakpaneImagePlugin);
    pane.registerPlugin(EssentialsPlugin);
    debugger
    pane.registerPlugin(CustomInput);

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

    scene.add(new THREE.GridHelper(10, 10));

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

    /**
     *
     */
    const batchRenderer = new BatchedParticleRenderer();
    scene.add(batchRenderer);

    const group = new THREE.Group();
    scene.add(group);

    const particleSystem = new ParticleSystem({
      duration: 5,
      looping: true,
      startLife: new IntervalValue(1.0, 1.0),
      startSpeed: new IntervalValue(1, 1),
      startSize: new IntervalValue(0.1, 0.1),
      startColor: new RandomColor(
        new THREE.Vector4(1, 0.91, 0.51, 1),
        new THREE.Vector4(1, 0.44, 0.16, 1)
      ),
      worldSpace: true,

      // maxParticle: 1000,
      emissionOverTime: new ConstantValue(1000),
      emissionBursts: [
        /*{
              time: 0,
              count: new ConstantValue(100),
              cycle: 1,
              interval: 0.01,
              probability: 1,
          },*/
      ],

      shape: new PointEmitter(),
      material: new THREE.MeshBasicMaterial({
        // map: this.texture,
        blending: THREE.AdditiveBlending,
        transparent: true,
        side: THREE.DoubleSide,
      }),
      startTileIndex: new ConstantValue(0),
      uTileCount: 10,
      vTileCount: 10,
      renderMode: RenderMode.BillBoard,
      renderOrder: 1,
    });
    particleSystem.addBehavior(
      new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.95, 0.75, 0), 0]]))
    );

    // batchRenderer.addSystem(particleSystem);
    // group.add(particleSystem.emitter);

    createFire0().then((psList) => {
      psList.forEach((ps) => {
        batchRenderer.addSystem(ps);
        group.add(ps.emitter);
      });

      bindingObject(pane, psList[0]);
    });

    const clock = new THREE.Clock();

    function tick(): void {
      batchRenderer.update(clock.getDelta());
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
      pane.dispose();
    };
  });

  return (
    <div>
      <div ref={container} />
    </div>
  );
}
