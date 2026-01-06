<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Overlay, PlayersPanelSingleton } from '@components'
import { userState } from './state'

const route = useRoute()

const showPlayersPanel = computed(() => {
  const isUserSetup = route.name === 'user-setup'
  const isHome = route.name === 'home' || route.path === '/'
  if (isUserSetup || isHome) return false

  return Boolean(userState.user)
})
</script>

<template>
  <div class="background-image" aria-hidden></div>

  <main class="container">
    <router-view />
  </main>

  <Overlay></Overlay>
  <PlayersPanelSingleton v-if="showPlayersPanel" />
</template>

<style scoped lang="scss">
.background-image {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-image: url('./assets/images/bg-gradient.svg');
  background-size: cover;
  background-position: center;
  pointer-events: none;
  z-index: 0;
}

.container {
  position: relative;
  z-index: 1;
}
</style>
