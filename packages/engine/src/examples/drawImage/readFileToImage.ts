import { useState, useCallback } from 'react';

type UseFileToImageContext = {
  handleDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  loadImageFromFile: (file: File) => void;
  loadedImage: HTMLImageElement | null;
};

function useFileToImage(): UseFileToImageContext {
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);

  const readFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const image = new Image();
        image.src = event.target?.result as string;
        image.onload = () => setLoadedImage(image);
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      readFile(file);
    },
    [readFile]
  );

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files![0];
      readFile(file);
    },
    [readFile]
  );

  return {
    handleDrop,
    handleFileChange,
    loadImageFromFile: readFile,
    loadedImage,
  };
}

export { useFileToImage }