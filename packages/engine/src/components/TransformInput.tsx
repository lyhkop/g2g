import { useImmer } from "use-immer";
import styles from "./TransformInput.module.css";
import { useEffect } from "react";

export interface IVector3 {
  x: number;
  y: number;
  z: number;
  [key: string]: number;
}

export interface ITransform {
  position: IVector3;
  rotation: IVector3;
  scale: IVector3;
}

interface TransformInputProps {
  data: ITransform;
  onChange?: (data: ITransform) => void;
}

export default function TransformInput({
  data,
  onChange,
}: TransformInputProps) {
  const [transform, updateTransform] = useImmer(data);

  useEffect(() => {
    updateTransform((draft) => {
      Object.assign(draft, data);
    });
  }, [data, updateTransform]);

  const handlePositionChange = (name: string, value: number) => {
    updateTransform((draft) => {
      draft.position[name] = value;
    });
    const newPosition = { ...transform.position };
    newPosition[name] = value;
    const newTransform = {
      ...transform,
      position: newPosition,
    };
    onChange?.(newTransform);
  };

  const handleRotationChange = (name: string, value: number) => {
    updateTransform((draft) => {
      draft.rotation[name] = value;
    });
    const newRotation = { ...transform.rotation };
    newRotation[name] = value;
    const newTransform = {
      ...transform,
      rotation: newRotation,
    };
    onChange?.(newTransform);
  };

  const handleScaleChange = (name: string, value: number) => {
    updateTransform((draft) => {
      draft.scale[name] = value;
    });
    const newScale = { ...transform.scale };
    newScale[name] = value;
    const newTransform = {
      ...transform,
      scale: newScale,
    };
    onChange?.(newTransform);
  };

  return (
    <div className={styles.transformInput}>
      <div className={styles.row}>
        <div className={styles.label}>Position</div>
        <div className={styles.inputGroup}>
          <label className={styles["transform-input__axis-label"]}>X</label>
          <input
            type="number"
            value={transform.position.x}
            onChange={(e) =>
              handlePositionChange("x", parseFloat(e.target.value))
            }
          />
          <label className={styles["transform-input__axis-label"]}>Y</label>
          <input
            type="number"
            value={transform.position.y}
            onChange={(e) =>
              handlePositionChange("y", parseFloat(e.target.value))
            }
          />
          <label className={styles["transform-input__axis-label"]}>Z</label>
          <input
            type="number"
            value={transform.position.z}
            onChange={(e) =>
              handlePositionChange("z", parseFloat(e.target.value))
            }
          />
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.label}>Rotation</div>
        <div className={styles.inputGroup}>
          <label className={styles["transform-input__axis-label"]}>X</label>
          <input
            type="number"
            value={transform.rotation.x}
            onChange={(e) =>
              handleRotationChange("x", parseFloat(e.target.value))
            }
          />
          <label className={styles["transform-input__axis-label"]}>Y</label>
          <input
            type="number"
            value={transform.rotation.y}
            onChange={(e) =>
              handleRotationChange("y", parseFloat(e.target.value))
            }
          />
          <label className={styles["transform-input__axis-label"]}>Z</label>
          <input
            type="number"
            value={transform.rotation.z}
            onChange={(e) =>
              handleRotationChange("z", parseFloat(e.target.value))
            }
          />
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.label}>Scale</div>
        <div className={styles.inputGroup}>
          <label className={styles["transform-input__axis-label"]}>X</label>
          <input
            type="number"
            value={transform.scale.x}
            onChange={(e) => handleScaleChange("x", parseFloat(e.target.value))}
          />
          <label className={styles["transform-input__axis-label"]}>Y</label>
          <input
            type="number"
            value={transform.scale.y}
            onChange={(e) => handleScaleChange("y", parseFloat(e.target.value))}
          />
          <label className={styles["transform-input__axis-label"]}>Z</label>
          <input
            type="number"
            value={transform.scale.z}
            onChange={(e) => handleScaleChange("z", parseFloat(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}
