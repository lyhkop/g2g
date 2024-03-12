import * as Cesium from "cesium";
import { Viewer } from "cesium";
import classNames from "classnames";
import { useEffect, useRef } from "react";

function initCesium(container: string) {
  Cesium.Ion.defaultAccessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0ZjI3NGUwMi02NzVmLTQ4NmItOGUzMi1lYjUwZGRjNTBhMGIiLCJpZCI6MTU4OTMsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NjkwNDcwOTN9.Lc8ELVseOlv-p0RPrGuI62Di5VNpJHubVYAv7vHqPRE";

  const viewer = new Cesium.Viewer(container, {
    timeline: false,
    animation: false,
  });

  const longitude = -73.966,
    latitude = 40.783,
    height = 20;

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
      scale: 1,
    }).then((model) => {
      viewer.scene.primitives.add(model);
      const removeListener = model.readyEvent.addEventListener(() => {
        viewer.camera.flyToBoundingSphere(model.boundingSphere, {
          duration: 0.0,
        });
        removeListener();
      });
    });
  } catch (error) {
    console.error(`Error loading model: ${error}`);
  }

  try {
    const hpr = new Cesium.HeadingPitchRoll(0, 0, 0);
    const fixedFrameTransform =
      Cesium.Transforms.localFrameToFixedFrameGenerator("north", "west");

    const localToWorld = Cesium.Transforms.headingPitchRollToFixedFrame(
      Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
      hpr,
      Cesium.Ellipsoid.WGS84,
      fixedFrameTransform
    )
    const worldToLocal = Cesium.Matrix4.inverse(localToWorld, new Cesium.Matrix4())

    Cesium.Cesium3DTileset.fromIonAssetId(2275207, {}).then((tileset) => {
      tileset.customShader = new Cesium.CustomShader({
        uniforms: {
          u_worldToLocal: {
            type: Cesium.UniformType.MAT4,
            value: worldToLocal
          },
          u_localToWorld: {
            type: Cesium.UniformType.MAT4,
            value: localToWorld
          }
        },
        vertexShaderText: `
        void vertexMain(VertexInput vsInput, inout czm_modelVertexOutput vsOutput) {
             vec4 pos = u_worldToLocal * czm_model * vec4(vsOutput.positionMC, 1.0);
             pos.z = 0.0;
             pos.w = 1.0;
             vsOutput.positionMC = (czm_inverseModel * u_localToWorld * pos).xyz;
           }
           `,
      });

      viewer.scene.primitives.add(tileset);
    });
  } catch (error) {
    console.log(error);
  }

  return viewer;
}

function CesiumFlattenPage() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cesiumViewer: Viewer;
    if (container.current) {
      cesiumViewer = initCesium("CesiumContainer");
    }

    return () => {
      cesiumViewer && cesiumViewer.destroy();
    };
  }, []);

  return (
    <>
      <div
        className={classNames(["w-[1024px]", "h-[768px]"])}
        id="CesiumContainer"
        ref={container}
      />
    </>
  );
}

export default CesiumFlattenPage;
