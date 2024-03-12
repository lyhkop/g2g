import * as THREE from "three";
class CustomCameraControls {
  camera;
  domElement;
  rotateStart;
  rotateEnd;
  rotateDelta;
  zoomStart;
  zoomEnd;
  zoomDelta;
  panStart;
  panEnd;
  panDelta;
  keys;
  panSpeed;
  zoomSpeed;
  rotateSpeed;
  constructor(camera: any, domElement: any) {
    this.camera = camera;
    this.domElement = domElement;

    // 初始化相机的位置和方向
    this.camera.position.set(0, 0, 5);
    this.camera.lookAt(0, 0, 0);

    // 初始化控制器的状态
    this.rotateStart = new THREE.Vector2();
    this.rotateEnd = new THREE.Vector2();
    this.rotateDelta = new THREE.Vector2();
    this.zoomStart = new THREE.Vector2();
    this.zoomEnd = new THREE.Vector2();
    this.zoomDelta = new THREE.Vector2();
    this.panStart = new THREE.Vector2();
    this.panEnd = new THREE.Vector2();
    this.panDelta = new THREE.Vector2();
    this.keys = {
      LEFT: 37,
      UP: 38,
      RIGHT: 39,
      BOTTOM: 40,
    };
    this.panSpeed = 0.5;
    this.zoomSpeed = 0.5;
    this.rotateSpeed = 0.5;

    // 绑定事件处理程序
    this.domElement.addEventListener(
      "contextmenu",
      this.onContextMenu.bind(this)
    );
    this.domElement.addEventListener("mousedown", this.onMouseDown.bind(this));
    this.domElement.addEventListener("wheel", this.onMouseWheel.bind(this));
    this.domElement.addEventListener("keydown", this.onKeyDown.bind(this));
    this.domElement.addEventListener("keyup", this.onKeyUp.bind(this));
  }

  // 禁用上下文菜单
  onContextMenu(event: any) {
    event.preventDefault();
  }

  // 处理鼠标按下事件
  onMouseDown(event: any) {
    event.preventDefault();

    switch (event.button) {
      case THREE.MOUSE.LEFT:
        // 禁用鼠标左键
        break;
      case THREE.MOUSE.RIGHT:
        this.rotateStart.set(event.clientX, event.clientY);
        break;
    }

    this.domElement.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.domElement.addEventListener("mouseup", this.onMouseUp.bind(this));
  }

  // 处理鼠标移动事件
  onMouseMove(event: any) {
    event.preventDefault();

    switch (event.button) {
      case THREE.MOUSE.LEFT:
        // 禁用鼠标左键
        break;
      case THREE.MOUSE.RIGHT:
        this.rotateEnd.set(event.clientX, event.clientY);
        this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);
        this.rotateCamera();
        this.rotateStart.copy(this.rotateEnd);
        break;
    }
  }

  // 处理鼠标抬起事件
  onMouseUp(event: any) {
    event.preventDefault();

    this.domElement.removeEventListener(
      "mousemove",
      this.onMouseMove.bind(this)
    );
    this.domElement.removeEventListener("mouseup", this.onMouseUp.bind(this));
  }

  // 处理鼠标滚轮事件
  onMouseWheel(event: any) {
    event.preventDefault();

    this.zoomEnd.set(event.clientX, event.clientY);
    this.zoomDelta.subVectors(this.zoomEnd, this.zoomStart);
    this.zoomCamera();
    this.zoomStart.copy(this.zoomEnd);
  }

  // 处理键盘按下事件
  onKeyDown(event: any) {
    switch (event.keyCode) {
      case this.keys.LEFT:
        this.panDelta.set(-this.panSpeed, 0);
        this.panCamera();
        break;
      case this.keys.UP:
        this.panDelta.set(0, this.panSpeed);
        this.panCamera();
        break;
      case this.keys.RIGHT:
        this.panDelta.set(this.panSpeed, 0);
        this.panCamera();
        break;
      case this.keys.BOTTOM:
        this.panDelta.set(0, -this.panSpeed);
        this.panCamera();
        break;
    }
  }

  // 处理键盘抬起事件
  onKeyUp(event: any) {
    switch (event.keyCode) {
      case this.keys.LEFT:
      case this.keys.UP:
      case this.keys.RIGHT:
      case this.keys.BOTTOM:
        this.panDelta.set(0, 0);
        break;
    }
  }

  // 旋转相机
  rotateCamera() {
    const theta = this.rotateDelta.x * this.rotateSpeed;
    const phi = this.rotateDelta.y * this.rotateSpeed;

    this.camera.position.x =
      Math.sin(theta) * Math.cos(phi) * this.camera.position.length();
    this.camera.position.y = Math.sin(phi) * this.camera.position.length();
    this.camera.position.z =
      Math.cos(theta) * Math.cos(phi) * this.camera.position.length();

    this.camera.lookAt(0, 0, 0);
  }

  // 缩放相机
  zoomCamera() {
    const zoomFactor = 1 + this.zoomDelta.y * this.zoomSpeed;

    this.camera.position.multiplyScalar(zoomFactor);
  }

  // 平移相机
  panCamera() {
    const pan = new THREE.Vector3()
      .copy(new THREE.Vector3(this.panDelta.x, this.panDelta.y))
      .multiplyScalar(this.panSpeed);

    this.camera.position.add(pan);
    this.camera.lookAt(0, 0, 0);
  }
}

export { CustomCameraControls };
