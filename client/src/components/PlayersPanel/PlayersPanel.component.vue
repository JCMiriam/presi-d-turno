<script setup lang="ts">
import { computed } from 'vue'
import { Section, PlayerCard } from '@components'
import { useRoomStore } from '@stores/room'
import { usePlayerListStore } from '@stores/playerList'

import type { PlayersPanelProps } from './PlayersPanel.types'

const props = withDefaults(defineProps<PlayersPanelProps>(), {
  size: 'sm',
})

const roomStore = useRoomStore()
const playerList = usePlayerListStore()

const title = computed(() => `Jugadores (${roomStore.players.length})`)
const subtitle = computed(() => (roomStore.roomId ? `# ${roomStore.roomId}` : undefined))
</script>

<template>
  <Section
    class="players-panel"
    :title="title"
    :subtitle="subtitle"
    :size="size"
    scrollable
  >
    <ul class="players-panel__list" role="list">
      <li v-for="p in playerList.players" :key="p.id" class="players-panel__item" role="listitem">
        <PlayerCard :id="p.id" :avatar-id="p.avatarId" :username="p.username" :points="p.points" :room-store="roomStore"></PlayerCard>
      </li>
    </ul>

    <p v-if="playerList.players.length === 0" class="players-panel__muted">Aún no hay jugadores.</p>
  </Section>
</template>

<style scoped lang="scss">
@use './PlayersPanel.styles.scss';
</style>
