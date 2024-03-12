import { BufferGeometry, Float32BufferAttribute, Group, Mesh, MeshStandardMaterial, Vector3 } from "three";

class ShapeBox extends Group {
	rightMesh: Mesh;
	leftMesh: Mesh;
	frontMesh: Mesh;
	backMesh: Mesh;
	topMesh: Mesh;
	bottomMesh: Mesh;

  constructor(
    width = 1,
    height = 1,
    depth = 1,
    widthSegments = 1,
    heightSegments = 1,
    depthSegments = 1
  ) {

		super()

    // segments

    widthSegments = Math.floor(widthSegments);
    heightSegments = Math.floor(heightSegments);
    depthSegments = Math.floor(depthSegments);

    // build each side of the box geometry

    const right = buildPlane(
      "z",
      "y",
      "x",
      -1,
      -1,
      depth,
      height,
      width,
      depthSegments,
      heightSegments,
      0
    ); // px
    const left = buildPlane(
      "z",
      "y",
      "x",
      1,
      -1,
      depth,
      height,
      -width,
      depthSegments,
      heightSegments,
      1
    ); // nx
    const top = buildPlane(
      "x",
      "z",
      "y",
      1,
      1,
      width,
      depth,
      height,
      widthSegments,
      depthSegments,
      2
    ); // py
    const bottom = buildPlane(
      "x",
      "z",
      "y",
      1,
      -1,
      width,
      depth,
      -height,
      widthSegments,
      depthSegments,
      3
    ); // ny
    const front = buildPlane(
      "x",
      "y",
      "z",
      1,
      -1,
      width,
      height,
      depth,
      widthSegments,
      heightSegments,
      4
    ); // pz
    const back = buildPlane(
      "x",
      "y",
      "z",
      -1,
      -1,
      width,
      height,
      -depth,
      widthSegments,
      heightSegments,
      5
    ); // nz

    // build geometry
    function buildPlane(
      u: string,
      v: string,
      w: string,
      udir: number,
      vdir: number,
      width: number,
      height: number,
      depth: number,
      gridX: number,
      gridY: number,
      materialIndex: number
    ) {
      const indices = [];
      const vertices = [];
      const normals = [];
      const uvs = [];

      const segmentWidth = width / gridX;
      const segmentHeight = height / gridY;

      const widthHalf = width / 2;
      const heightHalf = height / 2;
      const depthHalf = depth / 2;

      const gridX1 = gridX + 1;
      const gridY1 = gridY + 1;

      let vertexCounter = 0;
      let groupCount = 0;

      let vector = new Vector3();

      // generate vertices, normals and uvs

      for (let iy = 0; iy < gridY1; iy++) {
        const y = iy * segmentHeight - heightHalf;

        for (let ix = 0; ix < gridX1; ix++) {
          const x = ix * segmentWidth - widthHalf;

          // set values to correct vector component

          (vector as any)[u] = x * udir;
          (vector as any)[v] = y * vdir;
          (vector as any)[w] = depthHalf;

          // now apply vector to vertex buffer

          vertices.push(vector.x, vector.y, vector.z);

          // set values to correct vector component

          (vector as any)[u] = 0;
          (vector as any)[v] = 0;
          (vector as any)[w] = depth > 0 ? 1 : -1;

          // now apply vector to normal buffer

          normals.push(vector.x, vector.y, vector.z);

          // uvs

          uvs.push(ix / gridX);
          uvs.push(1 - iy / gridY);

          // counters

          vertexCounter += 1;
        }
      }

      // indices

      // 1. you need three indices to draw a single face
      // 2. a single segment consists of two faces
      // 3. so we need to generate six (2*3) indices per segment

      for (let iy = 0; iy < gridY; iy++) {
        for (let ix = 0; ix < gridX; ix++) {
          const a = ix + gridX1 * iy;
          const b = ix + gridX1 * (iy + 1);
          const c = (ix + 1) + gridX1 * (iy + 1);
          const d = (ix + 1) + gridX1 * iy;

          // faces

          indices.push(a, b, d);
          indices.push(b, c, d);

          // increase counter

          groupCount += 6;
        }
      }

      return {
        vertices,
        normals,
        uvs,
        indices,
      };
    }

    this.rightMesh = this.createBufferGeom(right);
    this.leftMesh = this.createBufferGeom(left);
    this.frontMesh = this.createBufferGeom(front);
    this.backMesh = this.createBufferGeom(back);
    this.topMesh = this.createBufferGeom(top);
    this.bottomMesh = this.createBufferGeom(bottom);

		this.add(this.rightMesh)
		this.add(this.leftMesh)
		this.add(this.frontMesh)
		this.add(this.backMesh)
		this.add(this.topMesh)
		this.add(this.bottomMesh)
  }

	private createBufferGeom(right: { vertices: any[]; normals: any[]; uvs: number[]; indices: any[]; }) {
		const geom = new BufferGeometry();
		geom.setIndex(right.indices);
		geom.setAttribute(
			"position",
			new Float32BufferAttribute(right.vertices, 3)
		);
		geom.setAttribute("normal", new Float32BufferAttribute(right.normals, 3));
		geom.setAttribute("uv", new Float32BufferAttribute(right.uvs, 2));
		return new Mesh(geom, new MeshStandardMaterial())
	}
}

export { ShapeBox };
