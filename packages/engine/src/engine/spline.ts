import { EventEmitter } from "events";
import * as THREE from "three";

export default class SplineComponent extends EventEmitter {
  constructor() {
    super();
    const spline = new THREE.CatmullRomCurve3([]);
    new THREE.CubicBezierCurve3();
  }
}
