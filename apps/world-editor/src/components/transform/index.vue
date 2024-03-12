<template>
  <Vec3 :x="transform.position[0]" :y="transform.position[1]" :z="transform.position[2]" @onChange="handleChange" />
</template>

<script setup lang="ts">

import { computed } from 'vue';
import { getEditor } from '../../stores'
import Vec3 from './vector3.vue';

const props = defineProps<{
  entityId: string;
  componentId: string;
}>()

const transform = computed(() => {
  const editor = getEditor()
  const entity = editor?.engine.scene.getObjectByProperty('uuid', props.entityId)
  const position = entity ? entity.position.toArray() : [0, 0, 0]
  const rotation = entity ? entity.rotation.toArray() : [0, 0, 0]
  const scale = entity ? entity.scale.toArray() : [1, 1, 1]
  return {
    position,
    rotation,
    scale
  }
})

const handleChange = (value: { x: number, y: number, z: number }) => {
  const editor = getEditor()
  const entity = editor?.engine.scene.getObjectByProperty('uuid', props.entityId)
  if (entity) {
    entity.position.x = value.x
    entity.position.y = value.y
    entity.position.z = value.z
  }
}

</script>

<style scoped></style>