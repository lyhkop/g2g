<template>
  <div @contextmenu="(e) => { e.preventDefault() }" ref="container"></div>
</template>

<script setup lang="ts">

import { onMounted, ref } from 'vue';
import { getEditor } from '../stores'

const container = ref<HTMLDivElement>()

const editor = getEditor()

onMounted(() => {
  if (container.value && editor) {
    container.value.appendChild(editor.engine.renderer.domElement)
    editor.engine.run()
  }
})

</script>