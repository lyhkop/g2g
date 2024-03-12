<script setup lang="ts">
// import ViewPort from './components/viewport/index.vue'
// import Transform from './components/transform/index.vue'
import Editor from './views/editor.vue'
// import { getEditor } from './stores'
// import { useEngineStore } from './stores'

// const engineStore = useEngineStore()

// const editor = getEditor()

</script>

<template>
  <div class="main">
    <Editor></Editor>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

.main {
  flex-direction: row;
  display: flex;
}
</style>
