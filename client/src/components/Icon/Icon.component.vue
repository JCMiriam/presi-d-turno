<script setup lang="ts">
import { computed } from 'vue'
import type { IconName, ColorName } from '@types'

type Props = {
  icon: IconName
  size: number
  color?: ColorName
}

const props = withDefaults(defineProps<Props>(), {
  color: 'pure-white' as ColorName,
})

// Carga todos los svg como “raw string”
const svgModules = import.meta.glob('../../assets/icons/*.svg', {
  as: 'raw',
  eager: true,
})

const svg = computed(() => {
  const key = `../../assets/icons/${props.icon}.svg`
  const raw = svgModules[key] as string | undefined
  return raw ?? ''
})

const colorClass = computed(() => (props.color ? `text-${props.color}` : ''))

const wrapperStyle = computed(() => ({
  display: 'block',
  width: `${props.size}px`,
  height: `${props.size}px`,
}))
</script>

<template>
  <span
    :class="colorClass"
    :style="wrapperStyle"
    class="icon"
    v-html="svg"
    aria-hidden="true"
  ></span>
</template>

<style scoped>
.icon :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
