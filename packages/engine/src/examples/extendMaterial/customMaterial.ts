import * as THREE from 'three'

class CustomMeshStanderMaterial extends THREE.MeshStandardMaterial {
  uniforms = {
    map_saturation: {
      value: 1.0,
    },
    map_contrast: {
      value: 1.0,
    },
    map_brightness: {
      value: 0.0
    }
  }

  constructor(options: THREE.MeshStandardMaterialParameters) {
    super()
  }

  onBeforeCompile(shader: THREE.Shader, renderer: THREE.WebGLRenderer): void {

    shader.uniforms = { ...shader.uniforms, ...this.uniforms }
    this.uniforms = shader.uniforms as any;

    shader.fragmentShader = shader.fragmentShader.replace(`void main() {`, `
    #ifdef USE_MAP
        uniform float map_saturation;
        uniform float map_contrast;
        uniform float map_brightness;
    #endif
    void main() {
    `);
    shader.fragmentShader = shader.fragmentShader.replace(`#include <map_fragment>`, `
    #include <map_fragment>
    #ifdef USE_MAP
          vec3 rgb = diffuseColor.rgb;
          rgb = mix(vec3(dot(vec3(.2125, .7154, .0721), rgb)), rgb, map_saturation);
          rgb = mix(vec3(.5), rgb, map_contrast);
          diffuseColor.rgb = rgb + map_brightness;
    #endif
    `)
  }

}

export { CustomMeshStanderMaterial }