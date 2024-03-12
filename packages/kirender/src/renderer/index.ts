import * as rhi from '../rhi/twgl-full'

class Renderer {
  constructor() {
    const canvas = document.getElementById('') as HTMLCanvasElement
    const gl = rhi.createContext(canvas);
    rhi.createBufferFromTypedArray(gl, new Float32Array())
  }
}