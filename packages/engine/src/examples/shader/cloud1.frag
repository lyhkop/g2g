// #version 300 es
// #ifdef GL_ES
//     precision highp float;
//     precision highp int;
//     precision mediump sampler3D;
// #endif

uniform float _CloudDensity;
uniform float _CloudSpeed;
uniform vec2 _Time;
uniform vec4 _MainTex_ST;
uniform sampler2D _MainTex;
uniform vec4 _Color;
uniform float _CloudNumber;
uniform vec4 _CloudColor;

#define UNITY_PI            3.14159265359f
#define UNITY_TWO_PI        6.28318530718f

float noise(vec2 uv) {
  return sin(1.5 * uv.x) * sin(1.5 * uv.y);
}

float fbm(vec2 p, int n) {
  mat2 m = mat2(0.6,0.8,-0.8,0.6);
  float f = 0.0;
  float a = 0.5;
	for (int i = 0; i < n; i++)
  {
    f += a * (_CloudDensity + 0.5 * noise(p));
		p = (m * p) * 2.0;
		a *= 0.5;
  }
  return f;
}

float cloud(vec2 uv)
{
  float _sin = sin(_CloudSpeed * 0.05 * _Time.x);
	float _cos = cos(_CloudSpeed * 0.05 * _Time.x);
	uv = vec2((_cos * uv.x + _sin * uv.y), -_sin * uv.x + _cos * uv.y);
	vec2 o = vec2(fbm(uv,6),fbm(uv + 1.2,6));
	float ol = length(o);
	o += 0.05 * vec2((_CloudSpeed * 1.35 * _Time.x + ol),(_CloudSpeed * 1.5 * _Time.x + ol));
	o *= 2.0;
	vec2 n = vec2(fbm(o + 9.0, 6), fbm(o + 5.0, 6));
	float f = fbm(2.0 * (uv + n), 4);
	f = f * 0.5 + smoothstep(0.0, 1.0, pow(f, 3.0) * pow(n.x, 2.0)) * 0.5 + smoothstep(0.0, 1.0, pow(f, 5.0) * pow(n.y, 2.0)) * 0.5;
  return smoothstep(0.0, 2.0, f);
}

vec4 frag(vec3 view)
{
  vec3 viewDir = normalize(view);
  
	vec2 uv = vec2((atan(viewDir.x, viewDir.z) + UNITY_PI) / UNITY_TWO_PI, acos(viewDir.y) / UNITY_PI);
	uv = uv * _MainTex_ST.xy + _MainTex_ST.zw;
	vec4 tex = texture(_MainTex, uv);
	vec4 col = tex * _Color;

	float y = min(viewDir.y + 1.0,1.0);
	float s = 0.5 * (1.0 + 0.4 * tan(1.9 + 2.5 * y));
	float th = uv.x * UNITY_PI * 2.0;
	vec2 _uv = vec2(sin(th) * 0.5, cos(th) * 0.5) * s * 5.0 * _CloudNumber + 0.5;
	float c = cloud(_uv * (s + 1.0));
	c *= smoothstep(0.0,0.4,y) * smoothstep(0.0,0.15,1.0 - y);
	return mix(col, _CloudColor, c * _CloudColor.a);
}

in vec3 view;

void main() {
	gl_FragColor = frag(view);
}