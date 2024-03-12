import { Mesh } from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

class ModelImporter {

  async parseGLB() {

    const loader = new GLTFLoader()
    const result = await loader.loadAsync('')

    result.scene.traverse(object3d=>{

    })

    const mesh = new Mesh()
    mesh.geometry.toJSON()

    mesh.toJSON()

    return {
      geometries: [],
      images: [],
      textures: [],
      materials: [],
      scenes: [] 
    }
  }
}