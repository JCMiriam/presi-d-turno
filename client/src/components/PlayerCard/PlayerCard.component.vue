<script setup lang="ts">
import { Avatar } from '@components'
import type { PlayerCardProps } from './PlayerCard.types'

const props = defineProps<PlayerCardProps>()
</script>

<template>
  <div class="player-card">
    <Avatar :id="avatarId" :alt="`Avatar ${avatarId}`" size="md" decorative />

    <div class="player-card__content">
      <div class="player-card__top">
        <span class="player-card__name">
          {{ username }}
          <span v-if="id === roomStore.myId" class="tag tag--you">tú</span>
        </span>

        <span class="player-card__points">{{ points }} pts</span>
      </div>
      <div class="player-card__tags">
        <span v-if="id === roomStore.hostId" class="tag">host</span>
        <span v-if="id === roomStore.presiId" class="tag tag--presi">presi</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use './PlayerCard.styles.scss';
</style>
