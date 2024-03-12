import * as Cesium from "cesium";
import * as THREE from "three";
import { CustomPrimitive } from "./CustomPrimitive";

function initCesium(container: string) {
  Cesium.Ion.defaultAccessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0ZjI3NGUwMi02NzVmLTQ4NmItOGUzMi1lYjUwZGRjNTBhMGIiLCJpZCI6MTU4OTMsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NjkwNDcwOTN9.Lc8ELVseOlv-p0RPrGuI62Di5VNpJHubVYAv7vHqPRE";

  const viewer = new Cesium.Viewer(container, {
    timeline: false,
    animation: false,
  });
  viewer.useDefaultRenderLoop = false;
  const scene = viewer.scene as any;

  viewer.scene.logarithmicDepthBuffer = false;

  viewer.scene.screenSpaceCameraController.enableInputs = false;

  viewer.scene.globe.show = true;

  const longitude = -73.966,
    latitude = 40.783,
    height = 20;

  try {
    // 自定义fabric材质
    const material = new Cesium.Material({
      fabric: {},
    });

    // viewer.entities.add({
    //   name: "",
    //   position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
    //   ellipsoid: {
    //     radii: new Cesium.Cartesian3(1, 1, 1),
    //     material: Cesium.Color.BLUE,
    //   },
    // });
  } catch (err) {
    console.error("add entity error!");
  }

  let dddd: CustomPrimitive
  try {
    // add custom primitive
    const primitive = new CustomPrimitive(new Cesium.Cartographic(Cesium.Math.toRadians(longitude), Cesium.Math.toRadians(latitude), height))
    viewer.scene.primitives.add(primitive);
    // viewer.camera.flyTo({
    //   destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
    //   duration: 0.1,
    // });
    dddd = primitive

  } catch (error) {
    
  }

  try {
    // use custom shader for gltf
    const customShader = new Cesium.CustomShader({
      vertexShaderText: `
      void vertexMain(VertexInput vsInput, inout czm_modelVertexOutput vsOutput) {
        vsOutput.positionMC = vsInput.attributes.positionMC;
      }    
      `,
      fragmentShaderText: `
      void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
        material.diffuse = vec3(1.0, 0.0, 1.0);
      }
      `,
      // varyings: {},
    });

    const hpr = new Cesium.HeadingPitchRoll(0, 0, 0);
    const fixedFrameTransform =
      Cesium.Transforms.localFrameToFixedFrameGenerator("north", "west");

    Cesium.Model.fromGltfAsync({
      url: "http://localhost:5173/assets/models/Cesium_Man.glb",
      customShader: customShader,
      modelMatrix: Cesium.Transforms.headingPitchRollToFixedFrame(
        Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
        hpr,
        Cesium.Ellipsoid.WGS84,
        fixedFrameTransform
      ),
      scale: 1
    }).then((model) => {
      viewer.scene.primitives.add(model);
      // const removeListener = model.readyEvent.addEventListener(() => {
      //   viewer.camera.flyToBoundingSphere(model.boundingSphere, {
      //     duration: 0.0,
      //   });
      //   removeListener();
      // });
    });
  } catch (error) {
    console.error(`Error loading model: ${error}`);
  }

  try {
    Cesium.Cesium3DTileset.fromIonAssetId(2275207, {}).then((tileset) => {
      viewer.scene.primitives.add(tileset);
    });
  } catch (error) {
    console.log(error);
  }

  const fragmentShaderSourceForColor = `
  uniform sampler2D colorTexture;
  in vec2 v_textureCoordinates;
  void main() {
      vec4 color = texture(colorTexture, v_textureCoordinates);
      out_FragColor = color;
  }
  `;
  const postProcessStageColor = new Cesium.PostProcessStage({
    fragmentShader: fragmentShaderSourceForColor,
  });
  viewer.scene.postProcessStages.add(postProcessStageColor);

  const fragmentShaderSourceForDepth = `
  uniform sampler2D depthTexture;
  in vec2 v_textureCoordinates;
  float getDistance(sampler2D depthTexture, vec2 texCoords) 
  { 
      float depth = texture(depthTexture, texCoords).r; 
      if (depth >= 1.0) {
          return 0.999999;
      }
      return depth;
  }
  void main() {
      out_FragColor = czm_packDepth(getDistance(depthTexture, v_textureCoordinates));
  }
  `;
  const postProcessStageDepth = new Cesium.PostProcessStage({
    fragmentShader: fragmentShaderSourceForDepth,
  });
  viewer.scene.postProcessStages.add(postProcessStageDepth);

  const getCesiumColorTexture = () => {
    return (postProcessStageColor as any).outputTexture;
  };

  const getCesiumDepthTexture = () => {
    return (postProcessStageDepth as any).outputTexture;
  };

  const updateCesiumCameraProjectionWithThree = (
    threeCamera: THREE.PerspectiveCamera
  ) => {
    const cesiumCamera = viewer.camera;

    const frustum = cesiumCamera.frustum as Cesium.PerspectiveFrustum;

    frustum.aspectRatio = threeCamera.aspect;
    frustum.near = threeCamera.near;
    frustum.far = threeCamera.far;
    const fov = threeCamera.fov * THREE.MathUtils.DEG2RAD;
    const fovX = 2 * Math.atan(Math.tan(fov / 2) * threeCamera.aspect);
    frustum.fov = fovX;


  };

  const updateCesiumCameraWithThree = (
    threeCamera: THREE.PerspectiveCamera
  ) => {
    const threeCameraPosition = threeCamera.position.clone();

    // console.log(threeCameraPosition);

    threeCamera.updateMatrixWorld();
    const x = new THREE.Vector3(1, 0, 0);
    const y = new THREE.Vector3(0, 1, 0);
    const z = new THREE.Vector3(0, 0, -1);
    x.applyMatrix4(threeCamera.matrixWorld);
    y.applyMatrix4(threeCamera.matrixWorld);
    z.applyMatrix4(threeCamera.matrixWorld);

    // local to wgs84
    const origin = Cesium.Cartographic.toCartesian(
      new Cesium.Cartographic(
        longitude * THREE.MathUtils.DEG2RAD,
        latitude * THREE.MathUtils.DEG2RAD,
        height
      )
    );
    const transformFunc = Cesium.Transforms.localFrameToFixedFrameGenerator(
      "east",
      "up"
    );
    const transform = transformFunc(origin);
    const positionWC = Cesium.Matrix4.multiplyByPoint(
      transform,
      new Cesium.Cartesian3(
        threeCameraPosition.x,
        threeCameraPosition.y,
        threeCameraPosition.z
      ),
      new Cesium.Cartesian3()
    );
    const xWC = Cesium.Matrix4.multiplyByPoint(
      transform,
      new Cesium.Cartesian3(x.x, x.y, x.z),
      new Cesium.Cartesian3()
    );
    const yWC = Cesium.Matrix4.multiplyByPoint(
      transform,
      new Cesium.Cartesian3(y.x, y.y, y.z),
      new Cesium.Cartesian3()
    );
    const zWC = Cesium.Matrix4.multiplyByPoint(
      transform,
      new Cesium.Cartesian3(z.x, z.y, z.z),
      new Cesium.Cartesian3()
    );

    const cesiumCamera = viewer.camera;

    cesiumCamera.position = Cesium.Cartesian3.fromArray([
      positionWC.x,
      positionWC.y,
      positionWC.z,
    ]);
    cesiumCamera.direction = Cesium.Cartesian3.normalize(
      new Cesium.Cartesian3(
        zWC.x - positionWC.x,
        zWC.y - positionWC.y,
        zWC.z - positionWC.z
      ),
      new Cesium.Cartesian3()
    );
    cesiumCamera.up = Cesium.Cartesian3.normalize(
      new Cesium.Cartesian3(
        yWC.x - positionWC.x,
        yWC.y - positionWC.y,
        yWC.z - positionWC.z
      ),
      new Cesium.Cartesian3()
    );
    cesiumCamera.right = Cesium.Cartesian3.normalize(
      new Cesium.Cartesian3(
        xWC.x - positionWC.x,
        xWC.y - positionWC.y,
        xWC.z - positionWC.z
      ),
      new Cesium.Cartesian3()
    );

    updateCesiumCameraProjectionWithThree(threeCamera);

    dddd.setTHREEModelViewMatrix(threeCamera.matrixWorldInverse, threeCamera.projectionMatrix);

    // hack to cesium czm_projection
    (Cesium as any).AutomaticUniforms.czm_projection.getValue = (state: any) =>{
      return Cesium.Matrix4.fromArray(threeCamera.projectionMatrix.toArray());
    }
  
  };

  const updateCesium = () => {
    viewer.render();
  };


  const packDepth = (depth: number)=>{
    let enc = (new THREE.Vector4(1.0, 255.0, 65025.0, 16581375.0)).multiplyScalar(depth);
    enc.sub(enc.clone().floor());
    enc.sub((new THREE.Vector4(enc.y, enc.z, enc.w, enc.w)).multiply(new THREE.Vector4(1.0 / 255.0, 1.0 / 255.0, 1.0 / 255.0, 0.0)));
    return enc;
  }

  const unPackDepth = (packedDepth: THREE.Vector4)=>{
    return packedDepth.dot(new THREE.Vector4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0))
  }

  console.log('打包值', packDepth(0.5))
  console.log('解包值', unPackDepth(packDepth(0.5)));


  const projectionMatrix = new THREE.Matrix4();
  projectionMatrix.fromArray([
    0.7135, 0, 0, 0, 
    0, 1.4281, 0, 0, 
    0, 0, -1.0000, -1, 
    0, 0, -2.0000, 0]);

  // -z -1
  // -2z

  // -z - 2
  // -z


  const pInEC = new THREE.Vector4(0, 0, -1000, 1)
  pInEC.applyMatrix4(projectionMatrix)
  console.log(pInEC);

  return {
    viewer,
    scene,
    updateCesiumCameraWithThree,
    updateCesium,
    getCesiumColorTexture,
    getCesiumDepthTexture,
  };
}

export { initCesium };
