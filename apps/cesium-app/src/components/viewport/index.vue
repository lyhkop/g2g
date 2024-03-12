<template>
  <div id="cesiumContainer"></div>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { Viewer, Cesium3DTileset } from 'cesium';


onMounted(() => {
  const viewer = new Viewer("cesiumContainer", {
    infoBox: false
  });

  Cesium3DTileset.fromUrl('http://127.0.0.1:8080/tileset.json', {}).then(tileset => {
    viewer.flyTo(tileset);
    viewer.scene.primitives.add(tileset);
  })
})

</script>

<style scoped>
#cesiumContainer {
  width: 100vw;
  height: 100vh;
}
</style>