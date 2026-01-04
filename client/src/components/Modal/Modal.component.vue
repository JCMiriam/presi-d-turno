<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch, nextTick } from 'vue'
import type { ModalProps } from './Modal.types'
import { Button } from '@components'

const props = withDefaults(defineProps<ModalProps>(), {
  hasLogo: true,
  hasCloseButton: true,
  closeOnOverlay: true,
  closeOnEsc: true,
  scrollable: false,
  size: 'md',
  ariaLabel: 'Modal dialog',
  submitText: 'Guardar',
  cancelText: 'Cancelar',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
}>()

const panelRef = ref<HTMLElement | null>(null)
const lastActiveEl = ref<HTMLElement | null>(null)

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

const onOverlayClick = (e: MouseEvent) => {
  if (!props.closeOnOverlay) return
  if (e.target === e.currentTarget) close()
}

const onKeydown = (e: KeyboardEvent) => {
  if (!props.modelValue) return

  if (props.closeOnEsc && e.key === 'Escape') {
    e.preventDefault()
    close()
    return
  }

  if (e.key === 'Tab') {
    const root = panelRef.value
    if (!root) return

    const focusables = root.querySelectorAll<HTMLElement>(
      [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(','),
    )

    if (!focusables.length) {
      e.preventDefault()
      root.focus()
      return
    }

    const first = focusables[0]
    const last = focusables[focusables.length - 1]

    if (e.shiftKey && document.activeElement === first && last) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last && first) {
      e.preventDefault()
      first.focus()
    }
  }
}

const lockScroll = () => {
  document.body.style.overflow = 'hidden'
}
const unlockScroll = () => {
  document.body.style.overflow = ''
}

const focusPanel = async () => {
  await nextTick()
  panelRef.value?.focus()
}

watch(
  () => props.modelValue,
  async (open) => {
    if (open) {
      lastActiveEl.value = document.activeElement as HTMLElement | null
      lockScroll()
      await focusPanel()
    } else {
      unlockScroll()
      lastActiveEl.value?.focus?.()
      lastActiveEl.value = null
    }
  },
  { immediate: true },
)

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  unlockScroll()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal" @click="onOverlayClick" aria-hidden="false">
        <div
          ref="panelRef"
          class="modal__panel"
          :class="{ 'modal__panel--scrollable': scrollable, [`modal__panel--${size}`]: true }"
          role="dialog"
          aria-modal="true"
          :aria-label="ariaLabel"
          tabindex="-1"
        >
          <header v-if="title || subtitle" class="modal__header">
            <div class="modal__header__container">
              <div v-if="hasLogo" class="modal__header--logo">
                <img src="../../assets/images/pdt-fullcolor-logo.svg" draggable="false" />
              </div>

              <div class="modal__header--content">
                <span v-if="subtitle" class="modal__header--subtitle">{{ subtitle }}</span>
                <span v-if="title" class="modal__header--title">{{ title }}</span>
              </div>
            </div>
          </header>

          <section class="modal__content">
            <slot></slot>
          </section>

          <section v-if="onCancel || onSubmit" class="modal__buttons">
            <Button
              v-if="onSubmit"
              :text="submitText"
              variant="primary"
              appearance="solid"
              color="pure-white"
              @click="onSubmit"
            ></Button>
            <Button
              v-if="onCancel"
              :text="cancelText"
              variant="danger"
              appearance="solid"
              color="pure-white"
              @click="onCancel"
            ></Button>
          </section>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
@use './Modal.styles.scss';
</style>
