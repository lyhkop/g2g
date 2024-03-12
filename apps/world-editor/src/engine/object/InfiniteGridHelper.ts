import * as THREE from "three";

class InfiniteGridHelper extends THREE.Mesh {
  color: THREE.Color;
  size1: number;
  size2: number;
  distance: number;

  constructor(
    size1: number,
    size2: number,
    color?: THREE.Color,
    distance?: number,
    axes = "xzy"
  ) {
    super();

    this.color = color || new THREE.Color("white");
    this.size1 = size1 || 10;
    this.size2 = size2 || 100;

    this.distance = distance || 8000;

    const planeAxes = axes.substr(0, 2);

    const geometry = new THREE.PlaneGeometry(2, 2, 1, 1);

    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,

      uniforms: {
        uSize1: {
          value: this.size1,
        },
        uSize2: {
          value: this.size2,
        },
        uColor: {
          value: this.color,
        },
        uDistance: {
          value: this.distance,
        },
      },
      transparent: true,
      vertexShader: `
         
         varying vec3 worldPosition;
     
         uniform float uDistance;
         
         void main() {
         
              vec3 pos = position.${axes} * uDistance;
              pos.${planeAxes} += cameraPosition.${planeAxes};
              
              worldPosition = pos;
              
              gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
         
         }
         `,

      fragmentShader: `
         
         varying vec3 worldPosition;
         
         uniform float uSize1;
         uniform float uSize2;
         uniform vec3 uColor;
         uniform float uDistance;
          
          
          
          float getGrid(float size) {
          
              vec2 r = worldPosition.${planeAxes} / size;
              
              
              vec2 grid = abs(fract(r - 0.5) - 0.5) / fwidth(r);
              float line = min(grid.x, grid.y);
              
          
              return 1.0 - min(line, 1.0);
          }
          
         void main() {
         
              
                float d = 1.0 - min(distance(cameraPosition.${planeAxes}, worldPosition.${planeAxes}) / uDistance, 1.0);
              
                float g1 = getGrid(uSize1);
                float g2 = getGrid(uSize2);
                
                
                gl_FragColor = vec4(uColor.rgb, mix(g2, g1, g1) * pow(d, 3.0));
                gl_FragColor.a = mix(0.5 * gl_FragColor.a, gl_FragColor.a, g2);
              
                if ( gl_FragColor.a <= 0.0 ) discard;
              
         
         }
         
         `,

      extensions: {
        derivatives: true,
      },
    });

    this.geometry = geometry;
    this.material = material;

    this.frustumCulled = false;
  }

  raycast(
    raycaster: THREE.Raycaster,
    intersects: THREE.Intersection<THREE.Object3D<THREE.Event>>[]
  ): void {
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0));
    const result = raycaster.ray.intersectPlane(plane, new THREE.Vector3());
    if (result) {
      const d = raycaster.ray.origin
        .clone()
        .subVectors(raycaster.ray.origin, result)
        .length();
      intersects.push({
        distance: d,
        point: result,
        object: this,
      });
    }
  }
}

export { InfiniteGridHelper };
