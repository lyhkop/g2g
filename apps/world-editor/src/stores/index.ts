import { defineStore } from "pinia";
import { ref } from "vue";
import { Editor } from "../engine/editor";

type HierarchyNode = {
  name: string;
  visible: boolean;
  type: "entity";
  id: string;
};

const useEngineStore = defineStore("engine", () => {
  const entityId = ref({
    data: "",
  });

  const sceneTree = ref<HierarchyNode[]>();

  const editor = getEditor() as Editor;

  const setSelectedEntityId = (id: string) => {
    entityId.value = {
      data: id,
    };
  };

  const updateSceneTree = () => {
    const sceneItems: HierarchyNode[] = editor.root.children.map((c) => {
      return {
        name: c.name,
        id: c.uuid,
        type: "entity",
        visible: c.visible,
      };
    });
    sceneTree.value = sceneItems;
  };

  return { entityId, setSelectedEntityId, sceneTree, updateSceneTree };
});

const getEditor = () => {
  return window.editor;
};

const createEditor = (): Editor => {
  if (!window.editor) {
    window.editor = new Editor();
  }
  return window.editor;
};

const destroyEditor = () => {
  window.editor = undefined;
  delete window.editor;
};

export { useEngineStore, createEditor, getEditor, destroyEditor };
