import { Angle, Color, Vec2 } from "./base";

export class Circle {
  /**
   * Create a filled circle
   * @param center - center of circle
   * @param radius - circle radius
   * @param color - fill color
   */
  constructor(
      public center: Vec2,
      public radius: number,
      public color: Color,
  ) {}
}

export class Arc {
  /**
   * Create a stroked arc
   * @param center - center of arc circle
   * @param radius - arc circle radius
   * @param start_angle - arc start angle
   * @param end_angle - arc end angle
   * @param color - stroke color
   */
  constructor(
      public center: Vec2,
      public radius: number,
      public start_angle: Angle,
      public end_angle: Angle,
      public width: number,
      public color: Color,
  ) {}
}

export class Polyline {
  /**
   * Create a stroked polyline
   * @param points - line segment points
   * @param width - thickness of the rendered lines
   * @param color - stroke color
   */
  constructor(
      public points: Vec2[],
      public width: number,
      public color: Color,
  ) {}
}

export class Polygon {
  vertices!: Float32Array;

  /**
   * Create a filled polygon
   * @param points - point cloud representing the polygon
   * @param color - fill color
   */
  constructor(
      public points: Vec2[],
      public color: Color,
  ) {}
}