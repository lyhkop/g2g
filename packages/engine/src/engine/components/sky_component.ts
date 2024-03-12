import { Sky } from 'three/examples/jsm/objects/Sky'
import { Component } from "../component";

class SkyComponent extends Component {
  
  private _sky: Sky = new Sky()

  init(): void {
    if (this.entity) {
      this.entity.add(this._sky)
    }
  }

  update(deltaTime: number): void {
    throw new Error("Method not implemented.");
  }

  private _updateSunPosition(date: Date) {
  }
}

export { SkyComponent }