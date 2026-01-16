<script setup lang="ts">
import { computed } from 'vue'
import type { AnswerCardProps } from './AnswerCard.types'

const props = withDefaults(defineProps<AnswerCardProps>(), {
  selected: false,
  disabled: false,
  readOnly: false,
  size: 'md',
})

const emit = defineEmits<{
  (e: 'click', id: string): void
  (e: 'toggle', payload: { id: string; selected: boolean }): void
}>()

const isInteractive = computed(() => !props.disabled && !props.readOnly)

const classes = computed(() => [
  'pdt-card',
  props.selected && 'is-selected',
  props.disabled && 'is-disabled',
  props.readOnly && 'is-readonly',
])

function onActivate() {
  if (!isInteractive.value || !props.id) return
  emit('click', props.id)
  emit('toggle', { id: props.id, selected: !props.selected })
}

function onKeydown(e: KeyboardEvent) {
  if (!isInteractive.value) return
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    onActivate()
  }
}
</script>

<template>
  <button
    class="pdt-card"
    :class="classes"
    type="button"
    :disabled="props.disabled"
    :aria-pressed="props.selected ? 'true' : 'false'"
    :aria-disabled="!isInteractive"
    @click="onActivate"
    @keydown="onKeydown"
  >
    <span class="pdt-card__text">{{ props.text }}</span>
  </button>
</template>

<style lang="scss" scoped>
@use './AnswerCard.styles.scss';
</style>
