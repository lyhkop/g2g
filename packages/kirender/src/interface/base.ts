export interface Vec2 {
  x: number;
  y: number;
}

export interface Angle {
  rad: number;
  deg: number;
}

export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface IDisposable {
  dispose(): void;
}