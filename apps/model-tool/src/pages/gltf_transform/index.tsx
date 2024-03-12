import { useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Input, message, Upload } from 'antd';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';

function GLTFTransformPage() {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [outPutPath, setOutPath] = useState('')

  const handleUpload = () => {
    const formData = new FormData();
    formData.append('file', fileList[0] as RcFile);
    formData.append('path', outPutPath)
    setUploading(true);
    // You can use any AJAX library you like
    fetch('http://localhost:3000/upload', {
      method: 'POST',
      mode: 'cors',
      body: formData,
    })
      .then((res) => res.json())
      .then(() => {
        setFileList([]);
        message.success('upload successfully.');
      })
      .catch(() => {
        message.error('upload failed.');
      })
      .finally(() => {
        setUploading(false);
      });
  };

  const props: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file]);

      return false;
    },
    fileList,
  };

  return (
    <>
      <Upload {...props}>
        <Button icon={<UploadOutlined />}>Select File</Button>
      </Upload>
      <Input placeholder="输出目录" value={outPutPath} onChange={
        (value)=>{
          setOutPath(value.target.value)
        }
      } />
      <Button
        type="primary"
        onClick={handleUpload}
        disabled={fileList.length === 0}
        loading={uploading}
        style={{ marginTop: 16 }}
      >
        {uploading ? 'Uploading' : 'Start Upload'}
      </Button>
    </>
  );
}

export { GLTFTransformPage }