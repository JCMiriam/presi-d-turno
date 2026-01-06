<script setup lang="ts">
import { computed, watch } from 'vue'
import { useOverlayStore } from '@stores/overlay.store'

const overlay = useOverlayStore()

const styleVars = computed(() => ({
  '--ov-opacity': String(overlay.options.opacity),
  '--ov-blur': `${overlay.options.blur}px`,
  '--ov-z': String(overlay.options.zIndex),
}))

watch(
  () => overlay.isOpen,
  (open) => {
    if (!overlay.options.lockScroll) return

    if (open) document.documentElement.classList.add('no-scroll')
    else document.documentElement.classList.remove('no-scroll')
  },
  { immediate: true },
)

const onClick = () => {
  if (overlay.options.closeOnClick) overlay.close()
}
</script>

<template>
  <Teleport to="body">
    <transition name="ov-fade">
      <div
        v-if="overlay.isOpen"
        class="overlay"
        :style="styleVars"
        :aria-label="overlay.options.ariaLabel"
        aria-hidden="true"
        @click="onClick"
      ></div>
    </transition>
  </Teleport>
</template>

<style scoped lang="scss">
@use './Overlay.styles.scss';
</style>
