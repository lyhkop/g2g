/* eslint-disable @typescript-eslint/no-unused-vars */
import { NodeIO, Transform } from '@gltf-transform/core';
import { ALL_EXTENSIONS, KHRONOS_EXTENSIONS } from '@gltf-transform/extensions';
import {
  resample,
  prune,
  dedup,
  draco,
  textureCompress,
  instance,
  palette,
  flatten,
  join,
  weld,
  WELD_DEFAULTS,
  simplify,
} from '@gltf-transform/functions';
import { createDecoderModule, createEncoderModule } from 'draco3dgltf';
import sharp from 'sharp'; // Node.js only.

function getLastDirectory(url: string) {
  const path = decodeURI(url);
  return path.substring(path.lastIndexOf('/') + 1);
}

function backfaceCulling(options: any) {
  return (document) => {
    for (const material of document.getRoot().listMaterials()) {
      material.setDoubleSided(!options.cull);
    }
  };
}

async function gltf_transform(buffer: Uint8Array, outPath: string) {
  const a = await createDecoderModule();
  const b = await createEncoderModule();
  const io = new NodeIO()
    .registerExtensions(KHRONOS_EXTENSIONS)
    .registerDependencies({
      'draco3d.decoder': a, // Optional.
      'draco3d.encoder': b, // Optional.
    });
  const document = await io.readBinary(buffer);

  await document.transform(
    // Losslessly resample animation frames.
    resample(),
    // Remove unused nodes, textures, or other data.
    prune({
      keepAttributes: false,
      keepLeaves: false,
      keepSolidTextures: false,
    }),
    // Remove duplicate vertex or texture data, if any.
    dedup(),
    // Compress mesh geometry with Draco.
    draco(),
    // Convert textures to WebP (Requires glTF Transform v3 and Node.js).
    textureCompress({
      encoder: sharp,
      targetFormat: 'webp',
      resize: [1024, 2024],
    }),
    // Custom transform.
    backfaceCulling({ cull: true }),
  );

  await io.write(`${outPath}/out.glb`, document);
}

export { gltf_transform };
