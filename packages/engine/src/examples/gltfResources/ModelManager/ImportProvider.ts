interface ImportResult {
  geometries: {
    file: Uint8Array,
    type: 'geom'
  }[],
  images: {
    name: string,
    type: 'png',
    file: Uint8Array
  }[],
  object: {},
  animations: {}[]
}

class ImportProvider {

  importGLB(url: string): ImportResult {
    const result: ImportResult = {
      geometries: [],
      images: [],
      object: {},
      animations: []
    }

    return result
  }
}

export { ImportProvider }
export type { ImportResult }