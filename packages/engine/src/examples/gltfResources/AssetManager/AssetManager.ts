import * as pc from 'playcanvas'
import * as THREE from 'three'

const canvas = document.getElementById('application') as HTMLCanvasElement;
const app = new pc.Application(canvas);
const assetManager = app.assets;
const box = new pc.Entity()
box.addComponent('model', {
  type: 'box'
});
app.root.addChild(box);


assetManager.loadFromUrl('', 'glb', (error, asset)=>{
  
})

class ModelComponentRenderData {
  
  scene!: THREE.Group

  textures: THREE.Texture[] = []

  materials: THREE.Material[] = []

  setSlotMaterial(id: string, material: THREE.Material) {
  }

  getSlotMaterial(id: string) {
    return new THREE.Material()
  } 

  destroy() {

  }
}

class GLBContainerResource {

  instantiate(): {
    textures: THREE.Texture[],
    materials: THREE.Material[],
    scenes: THREE.Group[],
    slots: Record<string, {
      materials: THREE.Material,
      meshes: THREE.Mesh[]
    }>
  } {
    return {textures:[], materials:[], scenes: [], slots: {}}
  }
}

const asset = assetManager.getByUrl('xxx.glb');
if (asset?.resource) {
  const resource = (asset.resource as GLBContainerResource).instantiate()

  const scene = resource.scenes[0]

  const modelCompData = {
    slots: [{
      id: ''
    }],
    sceneGraph: {},
    asset: {
      url: ''
    }
  }

  modelCompData.slots.forEach(slot=>{
    if (resource.slots[slot.id]) {
      resource.slots[slot.id].meshes.forEach(mesh=>{
        // mesh.material = assetManager.get()
      })
    }
  })
}
