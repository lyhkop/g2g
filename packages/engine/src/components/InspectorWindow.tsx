import { useEffect, useState } from 'react';
import useEditorStore from '../store/editor-store';
import { isNil } from 'lodash-es';
import * as THREE from 'three';
import { useControls, useCreateStore, LevaPanel } from 'leva';
import { List } from 'antd';
import { ModelRenderComponent } from '../engine/model-render-component';

type MaterialItem = {
  id: string;
  name: string;
};

export default function InspectorWindow() {
  const editor = useEditorStore((state) => state.editor);
  const selectedObjects = useEditorStore((state) => state.selectedObjects);

  const store1 = useCreateStore();
  const [options, set] = useControls(
    () => ({
      baseColorFactor: {
        value: '#ffffff',
        onChange: (v) => {
          onUpdateMaterialOptions(v);
        },
      },
      baseColorTexture: {
        image: '',
      },
      metallicFactor: {
        value: 1,
        min: 0,
        max: 1,
      },
      roughnessFactor: {
        value: 1,
        min: 0,
        max: 1,
      },
      metallicRoughnessTexture: {
        image: '',
      },
      normalTexture: {
        image: '',
      },
      occlusionTexture: {
        image: '',
      },
      emissiveTexture: {
        image: '',
      },
      emissiveFactor: {
        value: '#000000',
      },
      alphaMode: {
        options: ['OPAQUE', 'MASK', 'BLEND'],
      },
      alphaCutoff: {
        value: 0.5,
        min: 0,
        max: 1,
      },
      doubleSided: {
        value: false,
      },
    }),
    { store: store1 }
  );

  const [materialList, setMaterialList] = useState<MaterialItem[]>();
  const [selectedItem, setSelectedItem] = useState<MaterialItem>();
  const [selectedComponent, setSelectedComponent] =
    useState<ModelRenderComponent>();

  const handleItemClick = (item: { id: string; name: string }) => {
    setSelectedItem(item);
    if (selectedComponent) {
      const material = selectedComponent.materials.find(
        (m) => m.uuid === item.id
      );
      if (material) {
        set({
          baseColorFactor: `#${(
            material as unknown as THREE.MeshBasicMaterial
          ).color.getHexString()}`,
        });
      }
    }
  };

  const onUpdateMaterialOptions = (color: string) => {
    if (selectedComponent && selectedItem) {
      const material = selectedComponent.materials.find(
        (m) => m.uuid === selectedItem.id
      );
      if (material) {
        (material as any).color = new THREE.Color(color);
      }
    }
  };

  useEffect(() => {
    const activatedObject = selectedObjects[0];
    if (!isNil(activatedObject)) {
      // 获取点击的组件
      const component = editor?.findModelComponentByObject3D(activatedObject);
      if (component) {
        console.log('点击了模型组件', component.id);
        setSelectedComponent(component);
        setMaterialList(
          component.materials.map((m) => {
            return {
              id: m.uuid,
              name: m.name,
            };
          })
        );
      } else {
        setSelectedComponent(undefined);
        setMaterialList([]);
      }
    }
  }, [editor, selectedObjects]);

  return (
    <div>
      <div className='w-full h-60 overflow-auto'>
        <List
          dataSource={materialList}
          renderItem={(item) => (
            <List.Item
              className={selectedItem === item ? 'bg-[#e6f7ff]' : ''}
              onClick={() => handleItemClick(item)}
            >
              {item.name}
            </List.Item>
          )}
        />
      </div>
      <div>
        <LevaPanel store={store1} fill flat titleBar={false} />
      </div>
    </div>
  );
}
