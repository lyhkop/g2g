<template>
  <el-input-number :precision="3" v-model="x" size="small" controls-position="right" />
  <el-input-number :precision="3" v-model="y" size="small" controls-position="right" />
  <el-input-number :precision="3" v-model="z" size="small" controls-position="right" />
</template>

<script setup lang="ts">

import { computed, watch } from 'vue';

import { ElInputNumber } from 'element-plus'

const props = defineProps<{
  x: number,
  y: number,
  z: number
}>()

const emits = defineEmits<{
  (e: 'onChange', data: { x: number, y: number, z: number }): void
}>()

const x = computed(() => props.x)
const y = computed(() => props.y)
const z = computed(() => props.z)

watch(x, () => {
  emits('onChange', { x: x.value, y: y.value, z: z.value })
})

watch(y, () => {
  emits('onChange', { x: x.value, y: y.value, z: z.value })
})

watch(z, () => {
  emits('onChange', { x: x.value, y: y.value, z: z.value })
})
</script>