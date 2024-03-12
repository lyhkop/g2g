import { create } from "zustand";
import { Editor } from "../engine/editor";
import * as THREE from "three";

type EditorStoreState = {
  editor: Editor | null;
  selectedObjects: THREE.Object3D[];
  modelList: string[];
  sceneNodes: { name: string; children: number[] }[];
  setEditor: (object: Editor | null) => void;
  setSelectedObjects: (object: THREE.Object3D[]) => void;
  setModelList: (models: string[]) => void;
  setSceneNodes: (nodes: { name: string; children: number[] }[]) => void;
};
const useEditorStore = create<EditorStoreState>((set) => ({
  editor: null,
  selectedObjects: [],
  modelList: [],
  sceneNodes: [],
  setSelectedObjects: (objects: THREE.Object3D[]) =>
    set({ selectedObjects: objects }),
  setEditor: (editor: Editor | null) => set({ editor }),
  setModelList: (names: string[]) => set({ modelList: names }),
  setSceneNodes: (nodes: { name: string; children: number[] }[]) =>
    set({ sceneNodes: nodes }),
}));

export default useEditorStore;
