import * as Cesium from 'cesium'
import * as THREE from 'three'
export class CustomPrimitive {
  constructor(cartographicPosition: Cesium.Cartographic);

  setTHREEModelViewMatrix(matrix: THREE.Matrix4, projection: THREE.Matrix4);
}