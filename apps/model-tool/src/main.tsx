import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { GLTFTransformPage } from "./pages/gltf_transform";

const router = createBrowserRouter([
  {
    path: "/",
    element: <GLTFTransformPage />,
  },
  {
    path: "/app",
    element: <App />,
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
