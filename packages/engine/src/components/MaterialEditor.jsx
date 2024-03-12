import React, { useState } from "react";
import styles from "./MaterialEditor.module.css";

function MaterialEditor() {
  const [texture, setTexture] = useState(null);
  const [color, setColor] = useState("#ffffff");

  function handleTextureChange(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setTexture(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function handleColorChange(event) {
    setColor(event.target.value);
  }

  return (
    <div className={styles.materialEditor}>
      <h2>Material Editor</h2>
      <div className={styles.texture}>
        <label>Texture:</label>
        <input type="file" onChange={handleTextureChange} />
        {texture && <img src={texture} alt="Texture" />}
      </div>
      <div className={styles.color}>
        <label>Color:</label>
        <input type="color" value={color} onChange={handleColorChange} />
      </div>
    </div>
  );
}

function MaterialEditor2() {
  const [albedo, setAlbedo] = useState("#ffffff");
  const [metallic, setMetallic] = useState(0.0);
  const [roughness, setRoughness] = useState(0.5);

  function handleAlbedoChange(event) {
    setAlbedo(event.target.value);
  }

  function handleMetallicChange(event) {
    setMetallic(event.target.value);
  }

  function handleRoughnessChange(event) {
    setRoughness(event.target.value);
  }

  return (
    <div className={styles.materialEditor}>
      <div className={styles.header}>
        <h1 className={styles.title}>PBR Material Editor</h1>
        <button className={styles.saveButton}>Save</button>
      </div>
      <div className={styles.content}>
        <div className={styles.colorPicker}>
          <label htmlFor="albedo">Albedo</label>
          <input
            type="color"
            id="albedo"
            value={albedo}
            onChange={handleAlbedoChange}
          />
        </div>
        <div className={styles.slider}>
          <label htmlFor="metallic">Metallic</label>
          <input
            type="range"
            id="metallic"
            min="0"
            max="1"
            step="0.01"
            value={metallic}
            onChange={handleMetallicChange}
          />
        </div>
        <div className={styles.slider}>
          <label htmlFor="roughness">Roughness</label>
          <input
            type="range"
            id="roughness"
            min="0"
            max="1"
            step="0.01"
            value={roughness}
            onChange={handleRoughnessChange}
          />
        </div>
      </div>
    </div>
  );
}

// import React, { useState } from "react";
// import { ColorPicker, Icon } from "@unity/icons";
// import { colors } from "@unity/themes";
// import styles from "./MaterialEditor.module.css";

// function MaterialEditor3() {
//   const [baseColor, setBaseColor] = useState(colors.white);
//   const [metallic, setMetallic] = useState(0.5);
//   const [roughness, setRoughness] = useState(0.5);

//   const handleBaseColorChange = (color) => {
//     setBaseColor(color);
//   };

//   const handleMetallicChange = (value) => {
//     setMetallic(value);
//   };

//   const handleRoughnessChange = (value) => {
//     setRoughness(value);
//   };

//   return (
//     <div className={styles.materialEditor}>
//       <div className={styles.header}>
//         <Icon name="Material" size={24} />
//         <h2>Material Editor</h2>
//       </div>
//       <div className={styles.content}>
//         <div className={styles.colorPicker}>
//           <ColorPicker color={baseColor} onChange={handleBaseColorChange} />
//         </div>
//         <div className={styles.slider}>
//           <label htmlFor="metallic">Metallic</label>
//           <input
//             type="range"
//             id="metallic"
//             min="0"
//             max="1"
//             step="0.01"
//             value={metallic}
//             onChange={(e) => handleMetallicChange(parseFloat(e.target.value))}
//           />
//         </div>
//         <div className={styles.slider}>
//           <label htmlFor="roughness">Roughness</label>
//           <input
//             type="range"
//             id="roughness"
//             min="0"
//             max="1"
//             step="0.01"
//             value={roughness}
//             onChange={(e) => handleRoughnessChange(parseFloat(e.target.value))}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default MaterialEditor3;

export default MaterialEditor;
