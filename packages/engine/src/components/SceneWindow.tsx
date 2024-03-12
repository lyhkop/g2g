import { useEffect, useRef } from 'react';
import classNames from 'classnames';
import useEditorStore from '../store/editor-store';
import { EditorEvent } from '../engine/editor';

export default function SceneWindow() {
  const containerRef = useRef<HTMLDivElement>(null);

  const editor = useEditorStore((state) => state.editor);
  const setSelectedObjects = useEditorStore(
    (state) => state.setSelectedObjects
  );

  useEffect(() => {
    if (containerRef.current && editor) {
      containerRef.current.appendChild(editor.renderer.domElement);
      editor.on(EditorEvent.Pick_Object, (object: THREE.Object3D) => {
        setSelectedObjects([object as any]);
      });
    }

    const containerDom = containerRef.current;

    return () => {
      if (editor) {
        containerDom?.removeChild(editor.renderer.domElement);
      }
    };
  }, [editor, setSelectedObjects]);

  return (
    <div className={classNames('w-full', 'h-full')} ref={containerRef}></div>
  );
}
