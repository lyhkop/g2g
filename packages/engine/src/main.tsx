import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import AnimationPage from "./examples/animation/AnimationPage.tsx";
import PlayCanvasPage from "./examples/PlayCanvasPage.tsx";
import { Editor } from "./pages/Editor.tsx";
import ConnectBlender from "./examples/ConnectBlender/index.tsx";
import GHOSTPage from "./examples/ghost/index.tsx";
import Index from "./examples/index.tsx";
import { DynamicCloudPage } from "./examples/cloud/index.tsx";
import FPSPage from "./examples/fps/index.tsx";
import ShadowPage from "./examples/shadow/index.tsx";
import CesiumPage from './examples/cesium_three/index.tsx'
import { RotateEnvironmentsPage } from "./examples/rotate-environments/index.tsx";
import ColorAdjustmentPage from "./examples/color_adjustment/index.tsx";
import HeatMapPage from "./examples/heatmap/index.tsx";
import AXesHelperPage from "./examples/axesHelper/index.tsx";
import GLTFResourcesPage from "./examples/gltfResources/index.tsx";
import { ScriptDemo } from "./examples/ScriptComponent/index.tsx";
import CesiumFlattenPage from "./examples/cesium_flatten/index.tsx";
import { Particle_Demo } from "./examples/particle_demo/index.tsx";
import ExtrudeShapeDemo from "./examples/extrudeShape/index.tsx";
import { ExtendMaterialDemo } from "./examples/extendMaterial/index.tsx";
import { ProjectionMaterialDemo } from "./examples/projectionMaterial/index.tsx";
import { DrawImageDemo } from './examples/drawImage/index.tsx'
import { SubMeshDemo } from "./examples/submesh/index.tsx";

const router = createBrowserRouter([
  // {
  //   path: "/",
  //   element: <App />,
  // },
  {
    path: "/editor",
    element: <Editor />,
  },
  // {
  //   path: "/examples",
  //   element: <Index />,
  // },
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/animation",
    element: <AnimationPage />,
  },
  {
    path: "/playCanvas",
    element: <PlayCanvasPage />,
  },
  {
    path: "/connect_blender",
    element: <ConnectBlender />,
  },
  {
    path: "/ghost",
    element: <GHOSTPage />,
  },
  {
    path: "/cloud",
    element: <DynamicCloudPage />,
  },
  {
    path: '/fps',
    element: <FPSPage />
  },
  {
    path: '/shadow',
    element: <ShadowPage />
  },
  {
    path: '/gltfResources',
    element: <GLTFResourcesPage />
  },
  {
    path: '/cesium',
    element: <CesiumPage />
  },
  {
    path: '/rotateEnvironments',
    element: <RotateEnvironmentsPage />
  },
  {
    path: '/colorAdjustment',
    element: <ColorAdjustmentPage />
  },
  {
    path: '/heatMap',
    element: <HeatMapPage />
  },
  {
    path: '/axesHelper',
    element: <AXesHelperPage />
  },
  {
    path: '/script',
    element: <ScriptDemo id="" />
  },
  {
    path: '/CesiumFlattenPage',
    element: <CesiumFlattenPage />
  },
  {
    path: '/Particle_Demo',
    element: <Particle_Demo />
  },
  {
    path: '/ExtrudeShapeDemo',
    element: <ExtrudeShapeDemo />
  },
  {
    path: '/CustomMaterialDemo',
    element: <ExtendMaterialDemo />
  },
  {
    path: '/ProjectionMaterialDemo',
    element: <ProjectionMaterialDemo />
  },
  {
    path: '/DrawImageDemo',
    element: <DrawImageDemo />
  },
  {
    path: '/SubMeshDemo',
    element: <SubMeshDemo />
  }
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  // <React.StrictMode>
    <RouterProvider router={router} />
  // </React.StrictMode>
);
