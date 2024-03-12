<template>
  <div>
    <q-list bordered class="rounded-borders">
      <q-expansion-item switch-toggle-side expand-separator icon="perm_identity" label="Transform">
        <q-card>
          <q-card-section>
            <Vector3 :x="x" :y="y" :z="z" @on-change="handleChange" />
            <Vector3 :x="rx" :y="ry" :z="rz" @on-change="handleChangeRotation" />
            <Vector3 :x="sx" :y="sy" :z="sz" @on-change="handleChangeScale" />
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <q-expansion-item switch-toggle-side expand-separator icon="signal_wifi_off" label="Other">
        <q-card>
          <q-card-section>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem, eius reprehenderit eos corrupti
            commodi magni quaerat ex numquam, dolorum officiis modi facere maiores architecto suscipit iste
            eveniet doloribus ullam aliquid.
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">

import { ref } from 'vue';
import Vector3 from '../components/transform/vector3.vue'
import { getEditor, useEngineStore } from '../stores';

const x = ref(0)
const y = ref(0)
const z = ref(0)

const rx = ref(0)
const ry = ref(0)
const rz = ref(0)

const sx = ref(0)
const sy = ref(0)
const sz = ref(0)

const engineStore = useEngineStore()

engineStore.$subscribe(() => {
  const editor = getEditor()
  const entity = editor?.engine.scene.getObjectByProperty('uuid', engineStore.entityId.data)
  x.value = (entity ? entity.position.toArray() : [0, 0, 0])[0]
  y.value = (entity ? entity.position.toArray() : [0, 0, 0])[1]
  z.value = (entity ? entity.position.toArray() : [0, 0, 0])[2]

  rx.value = (entity ? entity.rotation.toArray() : [0, 0, 0])[0] as number
  ry.value = (entity ? entity.rotation.toArray() : [0, 0, 0])[1] as number
  rz.value = (entity ? entity.rotation.toArray() : [0, 0, 0])[2] as number

  sx.value = (entity ? entity.scale.toArray() : [0, 0, 0])[0]
  sy.value = (entity ? entity.scale.toArray() : [0, 0, 0])[1]
  sz.value = (entity ? entity.scale.toArray() : [0, 0, 0])[2]
})

const handleChange = (data: { x: number, y: number, z: number }) => {
  const editor = getEditor()
  const entity = editor?.engine.scene.getObjectByProperty('uuid', engineStore.entityId.data)
  if (entity) {
    entity.position.x = data.x
    entity.position.y = data.y
    entity.position.z = data.z
  }
}

const handleChangeRotation = (data: { x: number, y: number, z: number }) => {
  const editor = getEditor()
  const entity = editor?.engine.scene.getObjectByProperty('uuid', engineStore.entityId.data)
  if (entity) {
    entity.rotation.x = data.x
    entity.rotation.y = data.y
    entity.rotation.z = data.z
  }
}

const handleChangeScale = (data: { x: number, y: number, z: number }) => {
  const editor = getEditor()
  const entity = editor?.engine.scene.getObjectByProperty('uuid', engineStore.entityId.data)
  if (entity) {
    debugger
    entity.scale.x = data.x
    entity.scale.y = data.y
    entity.scale.z = data.z
  }
}
</script>