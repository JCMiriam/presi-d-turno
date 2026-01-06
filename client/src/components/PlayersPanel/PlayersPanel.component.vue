<script setup lang="ts">
import { computed } from 'vue'
import { Section, PlayerCard } from '@components'
import { useRoomStore } from '@stores/room'
import { usePlayerListStore } from '@stores/playerList'

const roomStore = useRoomStore()
const playerList = usePlayerListStore()

const title = computed(() => `Jugadores (${roomStore.players.length})`)
const subtitle = computed(() => (roomStore.roomId ? `# ${roomStore.roomId}` : undefined))
</script>

<template>
  <Section class="players-panel" :title="title" :subtitle="subtitle" size="full" scrollable>
    <ul class="players-panel__list" role="list">
      <li v-for="player in playerList.players" :key="player.id" class="players-panel__item" role="listitem">
        <PlayerCard
          :id="player.id"
          :avatar-id="player.avatarId"
          :username="player.username"
          :points="player.points"
          :is-me="player.id === roomStore.myEffectiveId"
          :is-host="player.id === roomStore.hostId"
          :is-presi="player.id === roomStore.presiId"
        />
      </li>
    </ul>
  </Section>
</template>

<style scoped lang="scss">
@use './PlayersPanel.styles.scss';
</style>
