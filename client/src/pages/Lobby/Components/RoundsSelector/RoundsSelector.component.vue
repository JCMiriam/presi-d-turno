<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Icon } from '@components'
import { useOverlayStore } from '@stores/overlay.store'
import type { RoundsSelectorProps } from './RoundsSelector.types'

const props = withDefaults(defineProps<RoundsSelectorProps>(), {
  disabled: false,
  id: 'rounds-select',
  hint: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const rootRef = ref<HTMLElement | null>(null)
const buttonRef = ref<HTMLElement | null>(null)
const mirrorButtonRef = ref<HTMLElement | null>(null)
const popoverRef = ref<HTMLElement | null>(null)

const isOpen = ref(false)
const activeIndex = ref(0)

const selectedIndex = computed(() => {
  const idx = props.options.findIndex((n) => n === props.modelValue)
  return idx >= 0 ? idx : 0
})

const selectedLabel = computed(() => String(props.modelValue))

const overlay = useOverlayStore()
const ownerId = computed(() => `RoundsSelector:${props.id}`)
const isOverlayOwner = computed(() => overlay.isOpen && overlay.ownerId === ownerId.value)

const buttonZIndex = computed(() => {
  const base = overlay.options.zIndex ?? 2000
  return isOverlayOwner.value ? base + 1 : 1
})

const popoverZIndex = computed(() => {
  const base = overlay.options.zIndex ?? 2000
  return isOverlayOwner.value ? base + 2 : 100
})

const buttonMirrorStyle = ref<Record<string, string>>({})
const popoverStyle = ref<Record<string, string>>({})

const computePositions = () => {
  const btn = buttonRef.value
  if (!btn) return

  const r = btn.getBoundingClientRect()

  buttonMirrorStyle.value = {
    position: 'fixed',
    top: `${r.top}px`,
    left: `${r.left}px`,
    width: `${r.width}px`,
    height: `${r.height}px`,
  }

  popoverStyle.value = {
    position: 'fixed',
    top: `${r.bottom + 8}px`,
    left: `${r.left}px`,
    width: `${r.width}px`,
  }
}

const open = async () => {
  if (props.disabled) return

  isOpen.value = true
  activeIndex.value = selectedIndex.value

  overlay.open({
    ownerId: ownerId.value,
    blur: 10,
    opacity: 0.35,
    closeOnClick: true,
    zIndex: 2000,
  })

  await nextTick()
  computePositions()
}

const close = () => {
  isOpen.value = false
  if (overlay.ownerId === ownerId.value) overlay.close()
}

const toggle = () => {
  if (props.disabled) return
  isOpen.value ? close() : open()
}

const selectAt = (idx: number) => {
  const value = props.options[idx]
  if (typeof value !== 'number') return
  emit('update:modelValue', value)
  close()
}

const onKeyDown = (e: KeyboardEvent) => {
  if (props.disabled) return

  if (!isOpen.value) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault()
      open()
    }
    return
  }

  if (e.key === 'Escape') {
    e.preventDefault()
    close()
    return
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = Math.min(activeIndex.value + 1, props.options.length - 1)
    return
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = Math.max(activeIndex.value - 1, 0)
    return
  }

  if (e.key === 'Enter') {
    e.preventDefault()
    selectAt(activeIndex.value)
  }
}

const onClickOutside = (e: PointerEvent) => {
  if (!isOpen.value) return

  const root = rootRef.value
  const mirror = mirrorButtonRef.value
  const pop = popoverRef.value
  const target = e.target as Node | null
  if (!target) return

  const clickedInsideRoot = root?.contains(target) ?? false
  const clickedInsideMirror = mirror?.contains(target) ?? false
  const clickedInsidePopover = pop?.contains(target) ?? false

  if (!clickedInsideRoot && !clickedInsideMirror && !clickedInsidePopover) {
    close()
  }
}

const onReposition = () => {
  if (isOpen.value) computePositions()
}

onMounted(() => {
  document.addEventListener('pointerdown', onClickOutside)
  window.addEventListener('resize', onReposition)
  window.addEventListener('scroll', onReposition, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onClickOutside)
  window.removeEventListener('resize', onReposition)
  window.removeEventListener('scroll', onReposition, true)
  if (overlay.ownerId === ownerId.value) overlay.close()
})

watch(
  () => overlay.ownerId,
  (newOwner) => {
    if (isOpen.value && newOwner !== ownerId.value) isOpen.value = false
  },
)
</script>

<template>
  <div ref="rootRef" class="rounds-selector" :class="{ 'rounds-selector--disabled': disabled }">
    <button
      ref="buttonRef"
      :id="`${id}-button`"
      class="rounds-selector__button"
      type="button"
      :disabled="disabled"
      :aria-expanded="isOpen"
      :aria-controls="`${id}-listbox`"
      @click="toggle"
      @keydown="onKeyDown"
    >
      <label class="rounds-selector__label" :for="`${id}-button`">{{ label }}</label>

      <span class="rounds-selector__value">
        {{ selectedLabel }}
        <Icon v-if="!disabled" icon="caret-down" :size="16" color="primary-dark" />
      </span>
    </button>

    <Teleport to="body">
      <button
        v-if="isOpen && isOverlayOwner"
        ref="mirrorButtonRef"
        class="rounds-selector__button rounds-selector__button--mirror"
        type="button"
        :disabled="disabled"
        :aria-expanded="isOpen"
        :aria-controls="`${id}-listbox`"
        :style="{ ...buttonMirrorStyle, zIndex: String(buttonZIndex) }"
        @click="toggle"
        @keydown="onKeyDown"
      >
        <span class="rounds-selector__label">{{ label }}</span>

        <span class="rounds-selector__value">
          {{ selectedLabel }}
          <Icon icon="caret-down" :size="16" color="primary-dark" />
        </span>
      </button>
    </Teleport>

    <Teleport to="body">
      <div
        v-show="isOpen"
        ref="popoverRef"
        class="rounds-selector__popover"
        :style="{ ...popoverStyle, zIndex: String(popoverZIndex) }"
        role="listbox"
        :id="`${id}-listbox`"
        :aria-label="label"
        @pointerdown.stop
        @click.stop
      >
        <button
          v-for="(opt, i) in options"
          :key="opt"
          class="rounds-selector__option"
          type="button"
          role="option"
          :aria-selected="opt === modelValue"
          :data-active="i === activeIndex"
          :data-selected="opt === modelValue"
          @mouseenter="activeIndex = i"
          @click.stop="selectAt(i)"
        >
          <span>{{ opt }}</span>
          <span v-if="opt === modelValue" class="rounds-selector__check" aria-hidden>✓</span>
        </button>
      </div>
    </Teleport>
  </div>
</template>

<style scoped lang="scss">
@use './RoundsSelector.styles.scss';
</style>
