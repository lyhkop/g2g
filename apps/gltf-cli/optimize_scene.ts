import * as fs from 'fs'

interface Resource {
  id: string;
  tag: string;
  type: 'privateMaterial' | 'publicMaterial' | 'texture';
  name: string;
  config: Record<string, any>;
}

interface MaterialSlot {
  initMaterialId: string;
  materialId: string;
}

interface Component {
  type: string;
  states: any[];
  data: {
    materialSlots: MaterialSlot[];
  };
}

const filePath = 'C:/Users/lyhko/Downloads/【正式场景勿动】中燃亚运专题_prjkEqSyt8SP6rtwl_1705051185273/project_info.json';

fs.readFile(filePath, 'utf8', (err: NodeJS.ErrnoException | null, data: string) => {
  if (err) {
    console.error(`Error reading file: ${err}`);
  } else {

    
    const scene = {content: JSON.parse(data)};
    const resources: Resource[] = scene.content.scenes[0].resources;
    const components: Component[] = scene.content.components;

    const usedMaterials = new Set<string>();
    const usedTextures = new Set<string>();

    components
    .filter((comp) => ['Model', 'InstanceModel'].includes(comp.type))
    .forEach((comp) => {
      comp.data.materialSlots.forEach((slot) => {
        usedMaterials.add(slot.initMaterialId);
        usedMaterials.add(slot.materialId);
      });
    });

    resources
    .filter(
      (resource) =>
        ['privateMaterial', 'publicMaterial'].includes(resource.type) &&
        usedMaterials.has(resource.tag)
    )
    .forEach((resource) => {
      for (const key in resource.config) {
        const value = resource.config[key];
        // 纹理属性存储了纹理的tag
        if (typeof value === 'string' && key.toLowerCase().endsWith('map')) {
          usedTextures.add(value);
        }
      }
    });

    const unusedMaterials: Set<string> = new Set()
    const unusedTextures: Set<string> = new Set()

    resources.forEach((resource) => {
      switch (resource.type) {
        case 'privateMaterial':
        case 'publicMaterial':
          if (!usedMaterials.has(resource.tag)) {
            unusedMaterials.add(resource.tag);
          }
          break;
        case 'texture':
          if (!usedTextures.has(resource.tag)) {
            unusedTextures.add(resource.tag);
          }
          break;
      }
    });

    console.log('未使用的纹理', [...unusedTextures])

    console.log('未使用的材质', [...unusedMaterials])

    // fetch('delete/resources', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ ids: [...unusedMaterials, ...unusedTextures] }),
    // });

  }
});