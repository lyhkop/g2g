import * as THREE from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { extrudePolygon, extrudePolyline } from "./lib/geometry-extrude";
import { ShapeBox } from "./shapeBox";

type shape3DType =
  | "box"
  | "sphere"
  | "cone"
  | "torus"
  | "cylinder"
  | "star"
  | "rect"
  | "roundRect"
  | "triangle"
  | "rightTriangle"
  | "parallelogram"
  | "trapezoid"
  | "billboard"
  | "plane";

export interface HTNode {
  c:
    | "ht.Block"
    | "ht.Camera"
    | "ht.Column"
    | "ht.Data"
    | "ht.DataModel"
    | "ht.Edge"
    | "ht.EdgeGroup"
    | "ht.Grid"
    | "ht.Group"
    | "ht.JSONSerializer"
    | "ht.Light"
    | "ht.List"
    | "ht.Node"
    | "ht.Notifier"
    | "ht.OverlappingBox"
    | "ht.Points"
    | "ht.Polyline"
    | "ht.Property"
    | "ht.Raycaster"
    | "ht.RefGraph"
    | "ht.Request"
    | "ht.SelectionModel"
    | "ht.Shape"
    | "ht.SubGraph"
    | "ht.Tab"
    | "ht.Text"
    | "ht.graph3d.DefaultInteractor"
    | "ht.graph3d.GlobeInteractor"
    | "ht.graph3d.Graph3dView"
    | "ht.graph3d.Interactor"
    | "ht.graph3d.MapInteractor"
    | "ht.graph.DefaultInteractor"
    | "ht.graph.GraphView"
    | "ht.graph.Interactor"
    | "ht.graph.MoveInteractor"
    | "ht.graph.ScrollBarInteractor"
    | "ht.graph.SelectInteractor"
    | "ht.graph.TextEditInteractor"
    | "ht.graph.TouchInteractor"
    | "ht.widget.AccordionView"
    | "ht.widget.BaseItemEditor"
    | "ht.widget.BorderPane"
    | "ht.widget.ListView"
    | "ht.widget.PropertyView"
    | "ht.widget.SplitView"
    | "ht.widget.TabView"
    | "ht.widget.TableHeader"
    | "ht.widget.TablePane"
    | "ht.widget.TableView"
    | "ht.widget.Toolbar"
    | "ht.widget.TreeTablePane"
    | "ht.widget.TreeTableView"
    | "ht.widget.TreeView";
  i: number;
  p: {
    position: { x: number; y: number };
    anchorElevation: number;
    width: number;
    height: number;
    tall: number;
    elevation: number;
    segments: { __a: number[] };
    points: { __a: { x: number; y: number }[] };
    thickness: number;
    displayName: string;
    rotation: number;
    parent: any;
  };
  s: {
    shape3d: shape3DType;

    // 3d图元可见性
    "3d.visible": boolean;

    "shape3d.reverse.cull": boolean;
    "shape3d.background": string;
    "shape3d.side.to": number;
    "shape3d.resolution": number;

    // shape3d透明
    "shape3d.transparent": boolean;

    // shape3d可见性
    "shape3d.visible": boolean;
    "shape3d.top.visible": boolean;
    "shape3d.bottom.visible": boolean;


    // shape3d颜色
    "shape3d.color": string;
    "shape3d.top.color": string;
    "shape3d.bottom.color": string;


    // 颜色
    "all.color": string;
    "top.color": string;
    "bottom.color": string;
    "front.color": string;
    "back.color": string;
    "right.color": string;
    "left.color": string;

    // 可见性
    "all.visible": string;
    "top.visible": boolean;
    "bottom.visible": boolean;
    "front.visible": boolean;
    "back.visible": boolean;
    "right.visible": boolean;
    "left.visible": boolean;

    // 背面剔除
    "all.reverse.cull": boolean;
    "top.reverse.cull": boolean;
    "bottom.reverse.cull": boolean;
    "front.reverse.cull": boolean;
    "back.reverse.cull": boolean;
    "right.reverse.cull": boolean;
    "left.reverse.cull": boolean;

    "all.reverse.flip": boolean;
    "top.reverse.flip": boolean;
    "bottom.reverse.flip": boolean;
    "front.reverse.flip": boolean;
    "back.reverse.flip": boolean;
    "right.reverse.flip": boolean;
    "left.reverse.flip": boolean;

    // 是否透明
    "all.transparent": boolean;
    "top.transparent": boolean;
    "bottom.transparent": boolean;
    "front.transparent": boolean;
    "back.transparent": boolean;
    "right.transparent": boolean;
    "left.transparent": boolean;

    // 透明度
    "all.opacity": number;
    "top.opacity": number;
    "bottom.opacity": number;
    "front.opacity": number;
    "back.opacity": number;
    "right.opacity": number;
    "left.opacity": number;
  };
}

function getAlphaFromRGBA(rgbaString: string) {
  // 匹配 rgba(r,g,b,a) 格式并提取alpha值
  const matches = rgbaString.match(/rgba\((\d+), (\d+), (\d+), ([\d.]+)/);

  if (matches && matches.length === 5) {
    return parseFloat(matches[4]);
  } else {
    return 1.0;
  }
}

function createShape2D(points: any, commands: any) {
  let currentIndex = 0;

  let shapeList: THREE.Shape[] = [];

  let shape = new THREE.Shape();

  for (let i = 0; i < commands.length; ++i) {
    const command = commands[i];

    if (command === 1) {
      const p0 = points[currentIndex];
      shape = new THREE.Shape();
      shapeList.push(shape);
      shape.moveTo(p0.x, p0.y);
      currentIndex += 1;
    } else if (command === 2) {
      const p0 = points[currentIndex];
      shape.lineTo(p0.x, p0.y);
      currentIndex += 1;
    } else if (command === 3) {
      const p0 = points[currentIndex];
      const p1 = points[currentIndex + 1];
      shape.quadraticCurveTo(p0.x, p0.y, p1.x, p1.y);
      currentIndex += 2;
    } else if (command === 4) {
      const p0 = points[currentIndex];
      const p1 = points[currentIndex + 1];
      const p2 = points[currentIndex + 2];
      shape.bezierCurveTo(p0.x, p0.y, p1.x, p1.y, p2.x, p2.y);
      currentIndex += 3;
    } else if (command === 5) {
    }
  }

  return shapeList;
}

function createShape(node: HTNode) {
  const { c: type, i: id, p: primitive, s: styleData } = node;

  const {
    displayName,
    width,
    height,
    elevation,
    tall,
    position,
    rotation,
    parent,
    points,
    segments,
    thickness,
  } = primitive;

  if (points && segments) {
    const { __a: pointList } = points;
    const { __a: commandList } = segments;

    if (pointList && commandList) {
      const shapeList = createShape2D(pointList, commandList);

      const geometries = shapeList.map((shape) => {
        const line: Array<[number, number]> = [];
        const points = shape.getPoints();
        points.forEach((p) => {
          line.push(p.toArray());
        });

        const { indices, position, uv, normal } = extrudePolyline([line], {
          depth: tall,
          lineWidth: thickness,
        });
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(position, 3)
        );
        geometry.setAttribute(
          "normal",
          new THREE.Float32BufferAttribute(normal, 3)
        );
        geometry.setIndex(new THREE.Uint16BufferAttribute(indices, 1));

        return geometry;
      });

      const geometry = BufferGeometryUtils.mergeGeometries(geometries);
      geometry.center();

      const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(styleData["all.color"]),
          emissive: new THREE.Color(styleData["all.color"]),
          metalness: 1.0,
        })
      );
      mesh.rotateZ(rotation ?? 0);

      mesh.position.set(position.x, position.y, elevation);

      return mesh;
    }
  }
}

function parseShape3dColor(color: string) {
  const colorString = color ?? "#3498DB";
  const alpha = getAlphaFromRGBA(colorString);
  return {
    color: new THREE.Color(colorString),
    alpha,
  };
}

function createBox(node: HTNode) {

  const { p, s } = node;

  const { width, height, tall, position, elevation, displayName } = p;

  if (s.shape3d === "box") {
    // 创建Box

    const { color, alpha: opacity } = parseShape3dColor(node.s["shape3d.color"]);

    const transparent = s["shape3d.transparent"] ?? false;

    const depthWrite = !transparent;

    const visible = s["3d.visible"] ?? true;

    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, tall, height),
      new THREE.MeshStandardMaterial({
        color,
        visible,
        transparent,
        opacity,
        depthWrite,
      })
    );

    mesh.position.set(position.x, elevation + tall / 2, position.y);

    mesh.name = displayName ?? ''

    return mesh;

  } else if (!s.shape3d) {
    // 创建六面体, 六个面可设置不同材质

    const { color, alpha: opacity } = parseShape3dColor(s['shape3d.color'] ?? s['all.color']);

    const transparent = s["shape3d.transparent"] ?? false;

    const depthWrite = !transparent;

    const visible = s["3d.visible"] ?? s['shape3d.visible'] ?? true;

    const emissive = color

    const cubeGeom = new THREE.BoxGeometry(width, tall, height);
    const mesh = new THREE.Mesh(cubeGeom, [
      new THREE.MeshStandardMaterial({
        // px
        color,
        visible,
        emissive
      }),
      new THREE.MeshStandardMaterial({
        // nx
        color,
        visible,
        emissive
      }),
      new THREE.MeshStandardMaterial({
        // py
        color,
        visible: s['shape3d.top.visible'] ?? visible,
        emissive
      }),
      new THREE.MeshStandardMaterial({
        // ny
        color,
        visible: s['shape3d.bottom.visible'] ?? visible,
        emissive
      }),
      new THREE.MeshStandardMaterial({
        // pz
        color,
        visible,
        emissive
      }),
      new THREE.MeshStandardMaterial({
        // nz
        color,
        visible,
        emissive
      }),
    ]);

    mesh.position.set(position.x, elevation + tall / 2, position.y);

    mesh.name = displayName ?? ''

    return mesh

  }

  const obj = new THREE.Object3D()
  obj.name = displayName ?? ''

  return obj;
}

export function createNode(node: HTNode) {

  let obj = new THREE.Object3D();

  if (node.c === 'ht.Node') {
  
    if (!node.s['shape3d'] || node.s['shape3d'] === 'box') {
      
      obj = createBox(node);
    
    } else if (node.s['shape3d'] === 'cylinder') {

    }
  
  } else if (node.c === 'ht.Shape') {

  }


  return obj;
}
