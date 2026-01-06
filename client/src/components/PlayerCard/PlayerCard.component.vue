<script setup lang="ts">
import { Avatar } from '@components'
import type { PlayerCardProps } from './PlayerCard.types'

defineProps<PlayerCardProps>()
</script>

<template>
  <div class="player-card">
    <div class="player-card__avatar">
      <Avatar :id="avatarId" :alt="`Avatar ${avatarId}`" size="md" decorative />
    </div>

    <div class="player-card__content">
      <div class="player-card__top">
        <span class="player-card__name">
          {{ username }}
          <span v-if="isMe" class="tag tag--you">tú</span>
        </span>

        <span class="player-card__points">{{ points }} pts</span>
      </div>

      <div class="player-card__tags">
        <span v-if="isHost" class="tag">host</span>
        <span v-if="isPresi" class="tag tag--presi">presi</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use './PlayerCard.styles.scss';
</style>
