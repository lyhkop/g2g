import { BladeApi, FolderApi } from "tweakpane";
import {
  ConstantValue,
  IntervalValue,
  ParticleSystem,
  PiecewiseBezier,
} from "../../libs/three.quarks/src";
import { BladeController, View } from "@tweakpane/core";

export function isConstantValue(v: any) {
  return v instanceof ConstantValue;
}

export function isIntervalValue(v: any) {
  return v instanceof IntervalValue;
}

type ValueTypes =
  | ConstantValue
  | IntervalValue
  | PiecewiseBezier
  | Number
  | string;

interface CreateInputFn<T extends ValueTypes> {
  (folder: FolderApi, value: T): BladeApi<BladeController<View>>;
}

enum StartLifeType {
  ConstantValue,
  IntervalValue,
  PiecewiseBezier,
}

export const addNumberInput = (
  folder: FolderApi,
  ps: ParticleSystem,
  property: keyof ParticleSystem,
  label: string
) => {
  return folder
    .addBinding({ value: ps[property] }, "value", {
      label,
    })
    .on("change", (ev) => {
      debugger;
      (ps as any)[property] = ev.value;
    });
};

const createConstantValueInput: CreateInputFn<ConstantValue> = (
  folder,
  constantValue
) => {
  return folder
    .addBinding({ value: constantValue.value }, "value", {
      label: "数值",
    })
    .on("change", (ev) => {
      constantValue.value = ev.value;
    });
};

const createIntervalValueInput: CreateInputFn<IntervalValue> = (
  folder,
  intervalValue
) => {
  return folder
    .addBinding(
      { value: { min: intervalValue.a, max: intervalValue.b } },
      "value",
      {
        label: "数值范围",
        min: 0,
        max: 100,
        step: 0.1,
      }
    )
    .on("change", (ev) => {
      intervalValue.a = ev.value.min;
      intervalValue.b = ev.value.max;
    });
};

// 提供一个占位的createPiecewiseBezierInput，待完善
const createPiecewiseBezierInput: CreateInputFn<PiecewiseBezier> = () => {
  // 实现PiecewiseBezier相关的输入控件
  throw new Error("PiecewiseBezier input not implemented yet.");
};

function determineValueType<T extends ValueTypes>(value: any): StartLifeType {
  if (value instanceof ConstantValue) {
    return StartLifeType.ConstantValue;
  } else if (value instanceof IntervalValue) {
    return StartLifeType.IntervalValue;
  } else if (value instanceof PiecewiseBezier) {
    return StartLifeType.PiecewiseBezier;
  } else {
    throw new Error("无法识别的类型");
  }
}

export function addInput<T extends any>(
  baseFolder: FolderApi,
  ps: T,
  property: keyof T,
  label: string
) {
  const inputFolder = baseFolder.addFolder({ title: label });
  let valueTypeInput: any;
  let valueInput: BladeApi<BladeController<View>> | null = null;

  const handleValueTypeChange = ({ value }: { value: StartLifeType }) => {
    valueInput && inputFolder.remove(valueInput);

    switch (value) {
      case StartLifeType.ConstantValue:
        if (!(ps[property] instanceof ConstantValue)) {
          (ps as any)[property] = new ConstantValue(1.0);
        }
        valueInput = createConstantValueInput(
          inputFolder,
          ps[property] as ConstantValue
        );
        break;

      case StartLifeType.IntervalValue:
        if (!(ps[property] instanceof IntervalValue)) {
          (ps as any)[property] = new IntervalValue(1.0, 2.0);
        }
        valueInput = createIntervalValueInput(
          inputFolder,
          ps[property] as IntervalValue
        );
        break;

      case StartLifeType.PiecewiseBezier:
        if (!(ps[property] instanceof PiecewiseBezier)) {
          // 初始化PiecewiseBezier
          // ps[property] = new PiecewiseBezier(...);
        }
        valueInput = createPiecewiseBezierInput(
          inputFolder,
          ps[property] as PiecewiseBezier
        );
        break;
    }
  };

  valueTypeInput = inputFolder.addBlade({
    view: "list",
    label: "数据类型",
    options: [
      { text: "常量", value: StartLifeType.ConstantValue },
      { text: "区间", value: StartLifeType.IntervalValue },
      { text: "曲线", value: StartLifeType.PiecewiseBezier },
    ],
    value: determineValueType(ps[property]),
  });
  valueTypeInput.on("change", handleValueTypeChange);

  handleValueTypeChange({ value: determineValueType(ps[property]) });

  return {
    valueTypeInput,
    valueInput
  }
}
