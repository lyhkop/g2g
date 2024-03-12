import { MOUSE, MathUtils } from "three";
import * as THREE from "three";

class CameraControls {
  SPEED: any;
  camera: THREE.Camera;
  unlocked: boolean;
  keys: Record<string, boolean>;
  prev_pos?: { x: number; y: number };
  constructor(camera: THREE.Camera, canvas: HTMLCanvasElement) {
    this.SPEED = {
      movement: 5.0, // units/second
      rotation: 0.003, // radians/pixel
    };

    this.camera = camera;
    this.unlocked = false;
    this.keys = {};

    window.addEventListener("mousedown", this.onMouseDown.bind(this));
    window.addEventListener("mouseup", this.onMouseUp.bind(this));
    window.addEventListener("mousemove", this.onMouseMove.bind(this));
    window.addEventListener("keydown", this.onKeyDown.bind(this));
    window.addEventListener("keyup", this.onKeyUp.bind(this));
  }

  update(dt: number) {
    if (this.unlocked) {
      let dist = this.SPEED.movement * dt;
      const axis = new THREE.Vector3();

      if (this.keys["ALT"]) {
        dist *= 0.3;
      }
      if (this.keys["SHIFT"]) {
        dist *= 3;
      }
      if (this.keys["w"]) {
        axis.z -= 1;
      }
      if (this.keys["s"]) {
        axis.z += 1;
      }
      if (this.keys["a"]) {
        axis.x -= 1;
      }
      if (this.keys["d"]) {
        axis.x += 1;
      }
      if (this.keys["q"]) {
        axis.y -= 1;
      }
      if (this.keys["e"]) {
        axis.y += 1;
      }
      this.camera.translateOnAxis(axis.normalize(), dist);
    }
  }

  onMouseDown(event: MouseEvent) {
    if (event.button == MOUSE.RIGHT) {
      this.unlocked = true;
    }
  }

  onMouseMove(event: MouseEvent) {
    if (this.unlocked && this.prev_pos) {
      const dh = event.clientX - this.prev_pos.x;
      const dv = event.clientY - this.prev_pos.y;
      this.camera.rotation.y -= this.SPEED.rotation * dh;
      this.camera.rotation.x -= this.SPEED.rotation * dv;
      this.camera.rotation.x = MathUtils.clamp(
        this.camera.rotation.x,
        -1.5,
        1.5
      );
    }
    this.prev_pos = { x: event.clientX, y: event.clientY };
  }

  onMouseUp(event: MouseEvent) {
    if (event.button == MOUSE.RIGHT) {
      this.unlocked = false;
    }
  }

  onKeyDown(event: KeyboardEvent) {
    this.keys[event.key] = true;
  }

  onKeyUp(event: KeyboardEvent) {
    this.keys[event.key] = false;
  }
}

// 创建一个相机控制器
class CameraControls2 {
  camera: THREE.Camera;
  domElement: HTMLCanvasElement;
  mouseX: any;
  mouseY: any;
  keys: any;
  moveForward: any;
  moveBackward: any;
  moveLeft: any;
  moveRight: any;
  constructor(camera: THREE.Camera, domElement: HTMLCanvasElement) {
    this.camera = camera;
    this.domElement = domElement;

    // 设置相机的初始位置和朝向
    this.camera.position.set(0, 0, 5);
    this.camera.lookAt(0, 0, 0);

    // 初始化控制器状态
    this.mouseX = 0;
    this.mouseY = 0;
    this.keys = {
      LEFT: 37,
      UP: 38,
      RIGHT: 39,
      BOTTOM: 40,
    };
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;

    // 绑定事件处理函数
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);

    // 添加事件监听器
    this.domElement.addEventListener("mousemove", this.onMouseMove, false);
    window.addEventListener("keydown", this.onKeyDown, false);
    window.addEventListener("keyup", this.onKeyUp, false);
  }

  // 处理鼠标移动事件
  onMouseMove(event: any) {
    this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  // 处理键盘按下事件
  onKeyDown(event: any) {
    switch (event.keyCode) {
      case this.keys.UP:
        this.moveForward = true;
        break;
      case this.keys.BOTTOM:
        this.moveBackward = true;
        break;
      case this.keys.LEFT:
        this.moveLeft = true;
        break;
      case this.keys.RIGHT:
        this.moveRight = true;
        break;
    }
  }

  // 处理键盘松开事件
  onKeyUp(event: any) {
    switch (event.keyCode) {
      case this.keys.UP:
        this.moveForward = false;
        break;
      case this.keys.BOTTOM:
        this.moveBackward = false;
        break;
      case this.keys.LEFT:
        this.moveLeft = false;
        break;
      case this.keys.RIGHT:
        this.moveRight = false;
        break;
    }
  }

  // 更新相机位置和朝向
  update(deltaTime: any) {
    // 根据鼠标位置计算相机的旋转角度
    const targetRotation = new THREE.Euler(
      this.mouseY * Math.PI,
      this.mouseX * Math.PI,
      0
    );

    // this.camera.rotation.lerp(targetRotation, 0.05);
    const a = new THREE.Quaternion();
    a.setFromEuler(targetRotation);
    this.camera.quaternion.slerp(a, 0.05);

    // 根据键盘按键状态计算相机的移动方向
    const direction = new THREE.Vector3();
    if (this.moveForward) direction.z -= 1;
    if (this.moveBackward) direction.z += 1;
    if (this.moveLeft) direction.x -= 1;
    if (this.moveRight) direction.x += 1;
    direction.normalize();

    // 将相机移动到新的位置
    const speed = 2;
    const distance = speed * deltaTime;
    const moveVector = direction.multiplyScalar(distance);
    this.camera.position.add(moveVector);
  }
}

export { CameraControls, CameraControls2 };
