import classNames from "classnames";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useFileToImage } from "./readFileToImage";
import { Select } from "antd";

function scaleAndCenterImage(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  image: ImageBitmap | HTMLImageElement,
  scaleMode: "clip" | "fill" = "clip"
) {
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const imgWidth = image.width;
  const imgHeight = image.height;

  // 计算基于canvas宽度和高度的最大缩放比例
  let scaleRatio;
  if (scaleMode === "clip") {
    scaleRatio = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
  } else {
    scaleRatio = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight);
  }

  let scaledWidth = imgWidth * scaleRatio;
  let scaledHeight = imgHeight * scaleRatio;

  // 居中绘制图片
  let x = (canvasWidth - scaledWidth) / 2;
  let y = (canvasHeight - scaledHeight) / 2;

  context.drawImage(image, x, y, scaledWidth, scaledHeight);
}

function DrawImageDemo() {
  const canvas = useRef<HTMLCanvasElement>(null);

  const { handleDrop, handleFileChange, loadedImage } = useFileToImage();

  const [selectedKey, setSelectedKey] = useState<string>();

  useEffect(() => {
    if (canvas.current) {
      const context = canvas.current.getContext("2d")!;

      const canvasWidth = 512;
      const canvasHeight = 512;
      canvas.current.width = canvasWidth;
      canvas.current.height = canvasHeight;

      loadedImage && scaleAndCenterImage(canvas.current!, context, loadedImage, selectedKey!);
    }
  }, [loadedImage, selectedKey]);

  const [scaleMode, setScaleMode] = useState<
    {
      label: string;
      value: string;
    }[]
  >([
    {
      label: 'clip',
      value: 'clip'
    },
    {
      label: 'fill',
      value: 'fill'
    }
  ]);

  const handleChange = (value: string) => {
    console.log(`selected ${value}`);
    setSelectedKey(value);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div
        onDrop={handleDrop}
        style={{ border: "2px dashed #ccc", padding: "20px" }}
      >
        <input
          type="file"
          accept=".jpg, .jpeg, .png"
          onChange={handleFileChange}
        />
      </div>
      <Select
        defaultValue={selectedKey}
        style={{ width: 120 }}
        onChange={handleChange}
        options={scaleMode}
      />
      <canvas
        className={classNames(["w-[512px]", "h-[512px]", "bg-black"])}
        ref={canvas}
      ></canvas>
    </div>
  );
}

export { DrawImageDemo };
