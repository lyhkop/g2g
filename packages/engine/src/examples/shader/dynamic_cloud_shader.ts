import * as THREE from 'three'
import dynamic_frag from '../shader/cloud1.frag'

const dynamic_cloud_shader: THREE.Shader = {
  uniforms: {
    _Color: {
      value: new THREE.Vector4(0, 0, 0, 0)
    },
    _MainTex: {
      value: null
    },
    _MainTex_ST: {
      value: new THREE.Vector4(1, 1, 0, 0)
    },
    _CloudColor: {
      value: new THREE.Vector4(1, 1, 1, 1)
    },
    _CloudSpeed: {
      value: 0.05
    },
    _CloudDensity: {
      value: 0.7
    },
    _CloudNumber: {
      value: 0.69
    },
    _Time: {
      value: new THREE.Vector2()
    }
  },
  vertexShader: `
  out vec3 view;
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    vec3 cameraWorldPosition = cameraPosition;
    vec4 v = modelMatrix * vec4( position, 1.0 );
    view = cameraWorldPosition.xyz - v.xyz;
  }
  `,
  fragmentShader: dynamic_frag
}

export { dynamic_cloud_shader }