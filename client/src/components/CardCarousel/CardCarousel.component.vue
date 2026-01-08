<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { AnswerCard } from '@components'

type AnswerCardT = { id: string; text: string }

const props = defineProps<{
  cards: Array<AnswerCardT | string>

  cardsById?: Record<string, AnswerCardT>

  selectedId?: string | null
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle', payload: { id: string; selected: boolean }): void
}>()

const scrollerRef = ref<HTMLElement | null>(null)

const resolvedCards = computed<AnswerCardT[]>(() => {
  return props.cards
    .map((c) => {
      if (typeof c === 'string') return props.cardsById?.[c]
      return c
    })
    .filter((c): c is AnswerCardT => Boolean(c?.id && c?.text))
})

const isDown = ref(false)
const isDragging = ref(false)
let startX = 0
let startScrollLeft = 0
let activePointerId: number | null = null
const DRAG_THRESHOLD_PX = 6

function onPointerDown(e: PointerEvent) {
  const el = scrollerRef.value
  if (!el) return
  if (e.pointerType === 'touch') return
  isDown.value = true
  isDragging.value = false
  activePointerId = e.pointerId

  startX = e.clientX
  startScrollLeft = el.scrollLeft
}

function onPointerMove(e: PointerEvent) {
  const el = scrollerRef.value
  if (!el || !isDown.value) return
  if (activePointerId !== e.pointerId) return

  const dx = e.clientX - startX

  if (!isDragging.value) {
    if (Math.abs(dx) < DRAG_THRESHOLD_PX) return

    isDragging.value = true
    el.setPointerCapture(e.pointerId)
    el.classList.add('is-dragging')
  }

  el.scrollLeft = startScrollLeft - dx
}

function endDrag() {
  const el = scrollerRef.value
  if (!el) return

  isDown.value = false
  isDragging.value = false
  activePointerId = null
  el.classList.remove('is-dragging')
}

function onPointerUp() {
  endDrag()
}

function onPointerCancel() {
  endDrag()
}

onBeforeUnmount(() => {
  endDrag()
})

function onCardToggle(payload: { id: string; selected: boolean }) {
  if (isDragging.value) return
  emit('toggle', payload)
}
</script>

<template>
  <div class="pdt-card-carousel">
    <div
      ref="scrollerRef"
      class="pdt-card-carousel__scroller"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerCancel"
    >
      <div class="pdt-card-carousel__track">
        <div v-for="c in resolvedCards" :key="c.id" class="pdt-card-carousel__item">
          <AnswerCard
            :id="c.id"
            :text="c.text"
            size="md"
            :selected="props.selectedId === c.id"
            :disabled="Boolean(props.disabled)"
            @toggle="onCardToggle"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use './CardCarousel.styles.scss';
</style>
