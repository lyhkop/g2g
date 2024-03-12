out vec3 vOrigin;
out vec3 vDirection;

void main() {

  mat4 viewMatrixInverse = inverse(viewMatrix);
  mat4 viewRotationInverse = mat4(viewMatrixInverse[0][0], viewMatrixInverse[1][0], viewMatrixInverse[2][0], 0.0, viewMatrixInverse[0][1], viewMatrixInverse[1][1], viewMatrixInverse[2][1], 0.0, viewMatrixInverse[0][2], viewMatrixInverse[1][2], viewMatrixInverse[2][2], 0.0, viewMatrixInverse[0][3], viewMatrixInverse[1][3], viewMatrixInverse[2][3], 1.0);

  gl_Position = projectionMatrix * viewRotationInverse * modelMatrix * vec4(position, 1.0);

  vec4 v = modelMatrix * vec4(position, 1.0);
  vOrigin = vec3(0.0);
  vDirection = normalize(v.xyz);

}