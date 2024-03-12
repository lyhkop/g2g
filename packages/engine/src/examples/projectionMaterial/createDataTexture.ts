import * as THREE from "three";
function createDataTextureFromVec3Array(vec3List: THREE.Vector3[]) {
  if (!vec3List.length) {
    throw new Error("Input array cannot be empty.");
  }

  const count = vec3List.length;
  let width = Math.sqrt(count);
  width = Math.ceil(width); // 取大于等于sqrt(count)的最小整数
  // let height = Math.ceil(count / width); // 调整高度以适应宽度，尽量不浪费纹理空间
  let height = width;

  let size = width * height * 4;
  let data = new Float32Array(size);
  for (let i = 0; i < vec3List.length; ++i) {
    data[i * 4] = vec3List[i].x;
    data[i * 4 + 1] = vec3List[i].y;
    data[i * 4 + 2] = vec3List[i].z;
    data[i * 4 + 3] = 0.0;
  }

  let dataTexture = new THREE.DataTexture(
    data,
    width,
    height,
    THREE.RGBAFormat,
    THREE.FloatType // 数据类型，指定为浮点数
  );

  // 设置纹理的其他属性
  dataTexture.minFilter = THREE.NearestFilter;
  dataTexture.magFilter = THREE.NearestFilter;
  
  dataTexture.needsUpdate = true;

  return dataTexture;
}

export { createDataTextureFromVec3Array }
