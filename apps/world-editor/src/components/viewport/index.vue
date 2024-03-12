<template>
  <div class="container" ref="container"></div>
</template>

<script setup lang="ts">

import { ref, onMounted } from 'vue'
import { createEditor } from '../../stores';

const container = ref<HTMLDivElement>()

onMounted(() => {
  if (container.value) {
    const editor = createEditor()
    const engine = editor.engine
    container.value.appendChild(engine.renderer.domElement)
    engine.run()
  }
})

</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
}
</style>