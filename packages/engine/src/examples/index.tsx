import { Link } from "react-router-dom";

function Index() {
  return <div className="flex flex-col">
  <Link to={"./fps"}>FPSDemo</Link>
  <Link to={"./shadow"}>ShadowDemo</Link>
  <Link to={"./ghost"}>GhostDemo</Link>
  <Link to={"./gltfResources"}>gltfResources</Link>
  <Link to={"./cloud"}>cloud</Link>
  <Link to={"./cesium"}>cesium</Link>
  </div>
}

export default Index