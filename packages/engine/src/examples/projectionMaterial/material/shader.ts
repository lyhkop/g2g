const glsl = `
vec2 getPointByIndex(sampler2D polygonTexture, int index) {
  ivec2 texSize = textureSize(polygonTexture, 0);

  float x = float(index % texSize.x);
  float y = float(index / texSize.x);

  float dx = 1.0 / float( texSize.x );
  float dy = 1.0 / float( texSize.y );

  y = dy * ( y + 0.5 );

  return texture2D( polygonTexture, vec2( dx * ( x + 0.5 ), y ) ).xy;
}

bool isIntersect(vec2 point, vec2 p1, vec2 p2) {
  bool cond1 = (p1.y > point.y) != (p2.y > point.y);
  bool cond2 = point.x < ((p2.x - p1.x) * (point.y - p1.y) / (p2.y - p1.y) + p1.x);
  return cond1 && cond2;
}

bool isInPolygon(vec2 point, sampler2D polygon, int length) {
  bool odd = false;
  for (int i = 0, j = length - 1; i < length; i++ ) {
    vec2 pi = getPointByIndex(polygon, i);
    vec2 pj = getPointByIndex(polygon, j);
    if (isIntersect(point, pi, pj)) {
      // Invert odd
      odd = !odd;
    }
    j = i;
  }
  return odd;
}
`