import * as pc from "playcanvas";
import { useEffect, useRef, useState } from "react";

export default function PlayCanvasPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [app, setApp] = useState<pc.Application>();

  useEffect(() => {
    if (canvasRef.current) {
      pc.WasmModule.setConfig("DracoDecoderModule", {
        glueUrl: "./assets/libs/draco/draco.wasm.js",
        wasmUrl: "./assets/libs/draco/draco.wasm.wasm",
        fallbackUrl: "./assets/libs/draco/draco.js",
      });

      pc.WasmModule.getInstance("DracoDecoderModule", () => {
        if (canvasRef.current) {
          const app = new pc.Application(canvasRef.current);

          app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
          app.setCanvasResolution(pc.RESOLUTION_AUTO);

          window.addEventListener("resize", () => app.resizeCanvas());

          const box = new pc.Entity("cube");
          box.addComponent("model", {
            type: "box",
          });
          // app.root.addChild(box);

          const camera = new pc.Entity("camera");
          camera.addComponent("camera", {
            clearColor: new pc.Color(0.1, 0.1, 0.1),
          });
          app.root.addChild(camera);
          camera.setPosition(0, 0, 3);

          const light = new pc.Entity("light");
          light.addComponent("light");
          app.root.addChild(light);
          light.setEulerAngles(45, 0, 0);

          app.on("update", (dt) => box.rotate(10 * dt, 20 * dt, 30 * dt));

          app.assets.loadFromUrl(
            "./assets/models/Soldier.glb",
            "container",
            (err, asset) => {
              if (asset) {
                const entity =
                  asset.resource.instantiateRenderEntity() as pc.Entity;

                const component = entity.addComponent("anim", {
                  activate: true,
                }) as pc.AnimComponent;

                const animStateGraphData = {
                  layers: [
                    {
                      name: "characterState",
                      states: [
                        {
                          name: "START",
                        },
                        {
                          name: "Movement",
                          speed: 1.0,
                          loop: true,
                          blendTree: {
                            type: "1D",
                            parameter: "blend",
                            children: [
                              {
                                name: "Idle",
                                point: 0.0,
                              },
                              {
                                name: "Run",
                                point: 1.0,
                                speed: 0.85,
                              },
                            ],
                          },
                        },
                      ],
                      transitions: [
                        {
                          from: "START",
                          to: "Movement",
                        },
                      ],
                    },
                  ],
                  parameters: {
                    blend: {
                      name: "blend",
                      type: "FLOAT",
                      value: 0,
                    },
                  },
                };

                // load the state graph into the anim component
                component.loadStateGraph(animStateGraphData);

                component.baseLayer.assignAnimation(
                  "Run",
                  asset.resource.animations[0]
                );

                app.root.addChild(entity);
              }
            }
          );

          app.start();
        }
      });
    }
  }, [canvasRef]);

  return (
    <div>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
