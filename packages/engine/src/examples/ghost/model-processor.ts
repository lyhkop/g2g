import * as THREE from "three";

let alpha = true;

class FresnelMaterial extends THREE.MeshStandardMaterial {
  uniforms = {
    uResolution: {
      value: new THREE.Vector2(window.innerWidth, window.innerHeight),
    },
    uColor: { value: new THREE.Color(0x0777fd) },
    uRimColor: { value: new THREE.Color(0x02feff) },
    uFresnelFactor: { value: 1.5 },
    uFresnelBias: { value: 0.05 },
    uIntensity: { value: 1.5 },
  };

  constructor(parameters?: THREE.MeshStandardMaterialParameters) {
    super(parameters);
    this.transparent = true;
  }

  modifyVertex(shader: THREE.Shader) {
    let token = "#define STANDARD";
    let insert = `
    out vec3 vObjectPosition;
    out vec2 vUv;
    out vec3 vView;
    out vec3 vNormal2;
    out vec3 csm_vPosition;
    `;
    shader.vertexShader = shader.vertexShader.replace(token, token + insert);

    token = "#include <begin_vertex>";
    insert = `
    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
    vec4 worldNormal = modelMatrix * vec4( normal, 0.0 );
    vObjectPosition = worldPosition.xyz;
    vUv = uv;
    vView = normalize( cameraPosition - worldPosition.xyz );
    vNormal2 = normalize( worldNormal.xyz );
    vec4 pos4 = modelMatrix * vec4(position, 1.0);
    csm_vPosition = vec3(pos4) / pos4.w;
    `;
    shader.vertexShader = shader.vertexShader.replace(token, token + insert);
  }

  modifyFragment(shader: THREE.Shader) {
    let token = "#define STANDARD";
    let insert = `
    uniform vec3 uColor;
    uniform float uFresnelFactor;
    uniform float uFresnelBias;
    uniform vec3 uRimColor;
    uniform float uIntensity;
    
    in vec3 vObjectPosition;
    in vec2 vUv;
    in vec3 vNormal2;
    in vec3 vView;
    in vec3 csm_vPosition;

    float fresnelFunc( float factor, float fresnelBias, vec3 normal, vec3 view )
    {
      return fresnelBias + ( 1.0 - fresnelBias ) * pow( 1.0 - abs(dot( normal , view )), factor );
    }
    `;
    shader.fragmentShader = shader.fragmentShader.replace(
      token,
      token + insert
    );

    token = "#include <dithering_fragment>";
    insert = `
    vec3 color = vec3(0.);

    vec3 normal2 = normalize(cross(dFdx(csm_vPosition), dFdy(csm_vPosition)));

    float fresnel = fresnelFunc( uFresnelFactor, uFresnelBias, normal2, vView );

    float diffuse = abs(dot(normal2, vView ));

    vec3 diffuseColor2 = uColor * diffuse;
  
    float alpha = ${alpha ? "fresnel" : (1.0).toFixed(1)};

    vec3 fresnelColor = uRimColor * fresnel * uIntensity;

    color = diffuseColor2 + fresnelColor; // color lines
  
    gl_FragColor = vec4( color, alpha ); // output color
    `;
    shader.fragmentShader = shader.fragmentShader.replace(token, insert);
  }

  onBeforeCompile(shader: THREE.Shader, renderer: THREE.WebGLRenderer): void {
    super.onBeforeCompile(shader, renderer);

    const uniforms = {
      uResolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
      uColor: { value: new THREE.Color(0x0777fd) },
      uRimColor: { value: new THREE.Color(0x02feff) },
      uFresnelFactor: { value: 1.5 },
      uFresnelBias: { value: 0.05 },
      uIntensity: { value: 1.5 },
    };

    shader.uniforms = {
      ...shader.uniforms,
      ...this.uniforms,
    };

    this.modifyVertex(shader);
    this.modifyFragment(shader);
  }
}

const fresnelMaterial = new FresnelMaterial();

const ghostMaterial = new THREE.MeshStandardMaterial()
ghostMaterial.transparent = true
ghostMaterial.opacity = 0.1
ghostMaterial.color = new THREE.Color(0x0777fd)
ghostMaterial.wireframe = true
ghostMaterial.emissive = new THREE.Color(0x0777fd)
ghostMaterial.emissiveIntensity = 1

const ghostMaterial2 = new THREE.MeshStandardMaterial()
ghostMaterial2.transparent = true
ghostMaterial2.opacity = 0.1
ghostMaterial2.color = new THREE.Color(0x0777fd)
ghostMaterial2.emissive = new THREE.Color(0x02feff)
ghostMaterial2.emissiveIntensity = 1
ghostMaterial2.side = THREE.DoubleSide

const lineMaterial = new THREE.LineBasicMaterial()

let lineMat = new THREE.LineBasicMaterial({
  color: "yellow",
  onBeforeCompile: (shader: { vertexShader: string; }) => {
    shader.vertexShader = `
    attribute vec3 instT;
    attribute vec4 instR;
    attribute vec3 instS;
    
    // http://barradeau.com/blog/?p=1109
    vec3 trs( inout vec3 position, vec3 T, vec4 R, vec3 S ) {
        position *= S;
        position += 2.0 * cross( R.xyz, cross( R.xyz, position ) + R.w * position );
        position += T;
        return position;
    }
    ${shader.vertexShader}
`.replace(
      `#include <begin_vertex>`,
      `#include <begin_vertex>
      transformed = trs(transformed, instT, instR, instS);
`
    );
    console.log(shader.vertexShader);
  }
} as any);

function createInstanceEdges(lineMeshes: THREE.LineSegments[], object3d: THREE.InstancedMesh) {
  const { geometry } = object3d
  const edgesGeometry = new THREE.EdgesGeometry(geometry)
  const instancedGeo = new THREE.InstancedBufferGeometry().copy(edgesGeometry as any)
  let pos: number[] = [];
  let rot: number[] = [];
  let scl: number[] = [];
  for (let i = 0; i < object3d.count; ++i) {
    const localMatrix = new THREE.Matrix4()
    object3d.getMatrixAt(i, localMatrix)
    localMatrix.multiply(object3d.matrix)
    const t = new THREE.Vector3()
    const q = new THREE.Quaternion()
    const s = new THREE.Vector3()
    localMatrix.decompose(t, q, s)
    pos.push(t.x, t.y, t.z)
    rot.push(q.x, q.y, q.z)
    scl.push(s.x, s.y, s.z)
  }
  instancedGeo.setAttribute("instT", new THREE.InstancedBufferAttribute(new Float32Array(pos), 3));
  instancedGeo.setAttribute("instR", new THREE.InstancedBufferAttribute(new Float32Array(rot), 4));
  instancedGeo.setAttribute("instS", new THREE.InstancedBufferAttribute(new Float32Array(scl), 3));
  let lines = new THREE.LineSegments(instancedGeo, lineMat);
  lineMeshes.push(lines)
}

export function preProcessModel(model: THREE.Object3D) {
  model.updateMatrixWorld()
  const lineMeshes: THREE.LineSegments[] = []
  const names: string[] = []
  const positions: Array<[number, number, number]> = []

  const json: {
    children: {
      id: string;
      position: {
        x: number,
        y: number,
        z: number
      };
      name: string;
    }[];
  } = {
    children: []
  }
  model.traverse((object3d) => {

    if (object3d.name.includes('电话')) {
      const worldPosition = new THREE.Vector3()
      object3d.getWorldPosition(worldPosition)
      names.push(object3d.name)
      positions.push(worldPosition.toArray())

      json.children.push({
        id: object3d.uuid,
        name: object3d.name,
        position: {
          x: worldPosition.x,
          y: worldPosition.y,
          z: worldPosition.z
        }
      })
    }

    if (
      object3d instanceof THREE.Mesh ||
      object3d instanceof THREE.SkinnedMesh ||
      object3d instanceof THREE.InstancedMesh
    ) {

      object3d.material = ghostMaterial2;
      object3d.frustumCulled = false
      
      // if (object3d instanceof THREE.InstancedMesh) {
      //   object3d.material = ghostMaterial2;
      // }

      // if (object3d instanceof THREE.Mesh) {
      //   object3d.material = ghostMaterial2
      // }
    }
  });

  console.log(names)

  console.log(positions)

  console.log(JSON.stringify(json))

  return {
    fresnelMaterial,
    lineMeshes,
  };
}
