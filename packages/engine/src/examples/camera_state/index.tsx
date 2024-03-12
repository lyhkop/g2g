interface CameraData {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  focalLength: number;
}

type CameraStates = Array<CameraData>;

class CameraComponent {
  constructor() {}

  setData(state: CameraData) {}

  private _update() {}
}

/**
 * 管理组件状态（增删改查）
 * 组件状态切换（更新3d显示效果）
 *
 * 提供数据给前端渲染
 * 提供方法给前端调用
 */
class EngineStatesManager {
  engine: any;

  componentStateMap: Map<
    string,
    {
      currentStateId: string;
      state: [];
    }
  > = new Map();

  getComponentState(id: string) {}

  addComponentState(id: string, state: any) {}

  switchComponentState(id: string, stateA: any, stateB: any) {}
}

class CameraComponentStateMachine {
  switchComponentState(component: any, stateA: any, stateB: any) {}
}
