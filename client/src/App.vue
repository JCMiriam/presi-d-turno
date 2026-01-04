<script setup lang="ts"></script>

<template>
  <div class="background-image" aria-hidden></div>
  <router-view />
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
</style>
