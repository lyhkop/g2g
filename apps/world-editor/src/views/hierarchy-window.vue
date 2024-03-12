<template>
  <div style="display: flex; flex-direction: column;">
    <div class="title" style="color: white; font-size: x-small; background-color: #282828; height: 1rem;">层级</div>
    <div class="bar">
      <div style="max-width: 350px;">
        <el-input prefix-icon="el-icon-search" size="small" v-model="search" placeholder="search"></el-input>
      </div>
    </div>
    <div class="content">
      <div v-for="item in sceneTree" :key="item.id">
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { useEngineStore } from '../stores';
import { ref } from 'vue'
import { storeToRefs } from 'pinia'

const search = ref()

const editorStore = useEngineStore()
const { sceneTree } = storeToRefs(editorStore)

</script>

<style scoped>
.el-input>>>.el-input__wrapper {
  background-color: black;
}
</style>