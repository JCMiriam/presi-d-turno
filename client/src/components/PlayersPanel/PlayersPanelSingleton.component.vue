<script setup lang="ts">
import { computed } from 'vue'
import PlayersPanel from './PlayersPanel.component.vue'
import { usePlayersPanelStore } from '@stores/playersPanel'
import { useRoomStore } from '@stores/room'

const panel = usePlayersPanelStore()
const roomStore = useRoomStore()

const shouldRender = computed(() => Boolean(roomStore.roomId))
</script>

<template>
  <Teleport v-if="shouldRender" :to="panel.target">
    <PlayersPanel size="full" :scrollable="false" />
  </Teleport>
</template>
