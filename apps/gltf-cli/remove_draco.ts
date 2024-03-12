import * as fs from 'fs/promises';
import * as path from 'path';

import { NodeIO, Transform, Document } from '@gltf-transform/core';
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
import draco3d from 'draco3dgltf';
import sharp from 'sharp'; // Node.js only.

const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({
        'draco3d.decoder': await draco3d.createDecoderModule(), // Optional.
        'draco3d.encoder': await draco3d.createEncoderModule(), // Optional.
    });

function removeDracoExtensionFromGLB(doc: Document) {
  doc.getRoot().listExtensionsUsed().forEach(item=>{
    if (item.extensionName === 'KHR_draco_mesh_compression') {
      item.dispose()
    }
  })

  doc.getRoot().listExtensionsRequired().forEach(item=>{
    if (item.extensionName === 'KHR_draco_mesh_compression') {
      item.dispose()
    }
  })
}


async function gltf_transform(path: string, outPath: string) {

  const document = await io.read(path);

  removeDracoExtensionFromGLB(document);

  await io.write(`${outPath}`, document);
}

async function getFilesInDir(dirPath: string, extension: string): Promise<string[]> {
  try {
    const dirents = await fs.readdir(dirPath, { withFileTypes: true });
    return dirents
      .filter(dirent => !dirent.isDirectory() && path.extname(dirent.name) === `.${extension}`) // 过滤掉目录条目
      .map(dirent => path.join(dirPath, dirent.name)); // 获取文件的完整路径

  } catch (err) {
    console.error(`Error reading directory: ${err}`);
    throw err;
  }
}

getFilesInDir('F:/3DModels/glb模型', 'glb')
  .then(files => {

    const outPath = 'F:/3DModels/glb模型2'

    files.forEach((file, i)=>{
      gltf_transform(file,  `${outPath}/${i}.glb`)
    })

  })
  .catch(err => console.error('An error occurred:', err));