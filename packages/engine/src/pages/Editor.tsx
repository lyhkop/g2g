import styles from './Editor.module.css';
import SceneWindow from '../components/SceneWindow';
import { EditorEvent, Editor as EngineEditor } from '../engine/editor';
import { useEffect } from 'react';
import useEditorStore from '../store/editor-store';
import MenuView from '../components/MenuView';
import InspectorWindow from '../components/InspectorWindow';
import { isNil } from 'lodash-es';

export function Editor() {
  const setEditor = useEditorStore((state) => state.setEditor);
  const setSelectedObjects = useEditorStore(
    (state) => state.setSelectedObjects
  );
  const modelList = useEditorStore((state) => state.modelList);
  const editor = useEditorStore((state) => state.editor);
  const sceneNodes = useEditorStore((state) => state.sceneNodes);

  useEffect(() => {
    const editor = new EngineEditor();
    editor.init();
    setEditor(editor);

    const onPickObject = (obj: THREE.Object3D) => {
      editor.setSelectedObjects([obj as any]);
      setSelectedObjects(editor.selectedObjects);
    };

    // 注册编辑器事件
    editor.on(EditorEvent.Pick_Object, onPickObject);
    // editor.on(EditorEvent.Update_Object, onPickObject);

    const handleKeyboardEvent = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Delete':
          {
            const activatedObject = editor.selectedObjects[0];
            editor.scene.remove(activatedObject);
            editor.setSelectedObjects([]);
            editor.transformControls.detach();
            setSelectedObjects(editor.selectedObjects);
          }
          break;
        case 't':
          {
            editor.transformControls.setMode('translate');
          }
          break;
        case 'r':
          {
            editor.transformControls.setMode('rotate');
          }
          break;
        case 's':
          {
            editor.transformControls.setMode('scale');
          }
          break;
        default:
          break;
      }
    };
    document.addEventListener('keydown', handleKeyboardEvent);

    return () => {
      setEditor(null);
      editor.removeListener(EditorEvent.Pick_Object, onPickObject);
      editor.destroy();
      document.removeEventListener('keydown', handleKeyboardEvent);
    };
  }, [setEditor, setSelectedObjects]);

  const createModelComponent = (name: string) => {
    if (!isNil(editor)) {
      editor.createModelComponent(name);
    }
  };

  return (
    <div className={styles['Editor']}>
      <div className={styles['Header']}>
        <div className={styles['Menu']} title='菜单栏'>
          <MenuView />
        </div>
        <div className={styles['ToolBar']} title='工具栏'>
          {/* <toolbar /> */}
        </div>
      </div>
      <div className={styles['Body']}>
        <div className={styles['Body-Left']}>
          <div className={styles['Body-Left-Top']}>
            <div className={styles['HierarchyWindow']} title='层级结构窗口'>
              {/* <HierarchyWindow /> */}
              {sceneNodes.map((node) => (
                <div key={node.name}>{node.name}</div>
              ))}
            </div>
            {/* <!-- <div className="GameWindow">游戏运行窗口</div> --> */}
            <div className={styles['SceneWindow']} title='场景编辑窗口'>
              <SceneWindow />
            </div>
          </div>
          <div className={styles['Body-Left-Bottom']}>
            <div className='ProjectWindow'>项目资源窗口</div>
            {modelList.map((n) => (
              <div
                key={n}
                onDoubleClick={() => {
                  createModelComponent(n);
                  console.log(n);
                }}
              >
                {n}
              </div>
            ))}
          </div>
        </div>
        <div className={styles['Body-Right']}>
          <div className={styles['InspectorWindow']} title='属性查看器'>
            <InspectorWindow />
          </div>
        </div>
      </div>
      <div className={styles['Footer']}>
        <div className={styles['Statusbar']}>状态</div>
      </div>
    </div>
  );
}
