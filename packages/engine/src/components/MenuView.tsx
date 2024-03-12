import useEditorStore from "../store/editor-store";
import * as THREE from "three";
import { nanoid } from "nanoid";
import { Button, Menu, MenuProps, Upload } from "antd";
import { RcFile } from "antd/es/upload";
import { isNil } from "lodash-es";
import localForage from "localforage";
import classNames from "classnames";

export default function MenuView() {
  const editor = useEditorStore((state) => state.editor);
  const setSelectedObjects = useEditorStore(
    (state) => state.setSelectedObjects
  );
  const setModelList = useEditorStore((state) => state.setModelList);

  const handleCreateEntity = (type: string) => {
    if (editor) {
      let object;
      switch (type) {
        case "box":
          object = new THREE.Mesh(
            new THREE.BoxGeometry(),
            new THREE.MeshStandardMaterial()
          );
          object.name = nanoid();
          object.position.set(10, 0, 0);
          editor.addObject(object);
          setSelectedObjects(editor.selectedObjects);
          break;
        case "light":
          object = new THREE.AmbientLight();
          object.name = nanoid();
          editor.addObject(object);
          setSelectedObjects(editor.selectedObjects);
          break;
        case "sphere":
          object = new THREE.Mesh(new THREE.SphereGeometry());
          object.name = nanoid();
          editor.addObject(object);
          setSelectedObjects(editor.selectedObjects);
          break;
        case "plane":
          object = new THREE.Mesh(new THREE.PlaneGeometry());
          object.name = nanoid();
          editor.addObject(object);
          setSelectedObjects(editor.selectedObjects);
          break;
        case "directionallight":
          {
            const color = 0xffffff;
            const intensity = 1;
            const light = new THREE.DirectionalLight(color, intensity);
            light.name = "DirectionalLight";
            light.target.name = "DirectionalLight Target";
            light.position.set(5, 10, 7.5);
            const lightHelper = new THREE.DirectionalLightHelper(light);
            const geometry = new THREE.SphereGeometry(2, 4, 2);
            const material = new THREE.MeshBasicMaterial({
              color: 0xff0000,
              visible: false,
            });
            const picker = new THREE.Mesh(geometry, material);
            picker.name = "picker";
            picker.userData.object = light;
            lightHelper.add(picker);
            // editor.addObject(light, lightHelper);
            editor.addLight(light);
          }
          break;
        case "saveScene":
          {
            editor.saveScene();
          }
          break;
        case "openScene":
          {
            editor.openScene();
          }
          break;
        default:
          break;
      }
    }
  };

  function handleFileUpload(file: RcFile) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const { target } = e;
      if (!isNil(target)) {
        editor?.assetManager
          .parseGLB(target.result as ArrayBuffer)
          .then((result) => {
            editor.assetManager.cache.setModel(file.name, result.scene);

            localForage.config({
              name: "G2G",
              storeName: "data",
            });
            localForage.setItem(file.name, target.result as ArrayBuffer);
            localForage.setItem("modelList", [
              ...editor.assetManager.cache.getModelKeys(),
            ]);

            setModelList([...editor.assetManager.cache.getModelKeys()]);
          });
      }
    };
    reader.readAsArrayBuffer(file);
  }

  const items: MenuProps["items"] = [
    {
      label: "添加物体",
      key: "AddObject",
      children: [
        {
          label: "add sky",
          key: "sky",
        },
        {
          label: "add plane",
          key: "plane",
        },
        {
          label: "add box",
          key: "box",
        },
        {
          label: "add light",
          key: "light",
        },
        {
          label: "add sphere",
          key: "sphere",
        },
        {
          label: "add directionallight",
          key: "directionallight",
        },
        {
          label: "saveScene",
          key: "saveScene",
        },
      ],
    },
  ];

  const onClick: MenuProps['onClick'] = (e) => {
    handleCreateEntity(e.key)
  }

  return (
    <>
      <Menu items={items} onClick={onClick} mode="horizontal" />
      {/* <Upload
        beforeUpload={handleFileUpload}
        showUploadList={false}
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        customRequest={() => {}}
      >
        <Button className='text-light-50' size='large'>
          上传路径
        </Button>
      </Upload> */}
    </>
  );
}
