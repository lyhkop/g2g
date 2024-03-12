import { Transform, Document, BufferUtils, NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import draco3d from "draco3dgltf";
import sharp from "sharp";

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    "draco3d.decoder": await draco3d.createDecoderModule(), // Optional.
    "draco3d.encoder": await draco3d.createEncoderModule(), // Optional.
  });

function setAoUV() {
  return async (document: Document): Promise<void> => {
    const logger = document.getLogger();
    const materials = document.getRoot().listMaterials();
    await Promise.all(
        materials.map(async (material) => {
         const textureInfo = material.getOcclusionTextureInfo();
         if (textureInfo) {
            textureInfo.setTexCoord(1);
         }
      })
    );
  };
}

const path = "C:/Users/lyhko/Downloads/GLB/建筑.glb";
const outPath = "C:/Users/lyhko/Downloads/GLB/2/建筑.glb";
const document = await io.read(path);

await document.transform(setAoUV());

await io.write(`${outPath}`, document);
