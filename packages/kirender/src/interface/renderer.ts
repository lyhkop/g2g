import { Angle, Color, IDisposable, Vec2 } from "./base";
import { Arc, Circle, Polygon, Polyline } from "./shape";

export interface IRenderer extends IDisposable {

  /**
   * draw a filled circle
   * @param circle 
   */
  circle(circle: Circle): void;
  circle(center: Vec2, radius: number, color?: Color): void;
  circle(circle_or_center: Circle | Vec2, radius?: number, color?: Color): void;

  /**
   * 
   * @param arc 
   */
  arc(arc: Arc): void;
  arc(
      center: Vec2,
      radius: number,
      start_angle: Angle,
      end_angle: Angle,
      width?: number,
      color?: Color,
  ): void;
  arc(
      arc_or_center: Arc | Vec2,
      radius?: number,
      start_angle?: Angle,
      end_angle?: Angle,
      width?: number,
      color?: Color,
  ): void;

  line(line: Polyline): void;
  line(points: Vec2[], width?: number, color?: Color): void;
  line(
      line_or_points: Polyline | Vec2[],
      width?: number,
      color?: Color,
  ): void;

  polygon(polygon: Polygon): void;
  polygon(points: Vec2[], color?: Color): void;
  polygon(polygon_or_points: Polygon | Vec2[], color?: Color): void;

  glyphs(glyphs: any[]): void;

  render(): void;
}
