<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Avatar, Modal } from '@components'
import { AVATARS } from '@data/avatars'

import type { AvatarGalleryProps } from './AvatarGallery.types'

const props = withDefaults(
  defineProps<
    AvatarGalleryProps & {
      modelValue: number | null
      open: boolean
    }
  >(),
  {
    disabled: false,
    minCellPx: 64,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
  (e: 'update:open', value: boolean): void
  (e: 'close'): void
}>()

// Avatar “en preview” dentro de la galería (NO confirmado)
const tempSelected = ref<number | null>(null)

// Cada vez que se abre el modal, sincronizamos tempSelected con el avatar confirmado
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) tempSelected.value = props.modelValue
  },
  { immediate: true },
)

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(auto-fit, minmax(${props.minCellPx}px, 1fr))`,
}))

const closeModal = () => {
  emit('update:open', false)
  emit('close')
}

// Solo cambia el preview
const preview = (id: number) => {
  if (props.disabled) return
  tempSelected.value = id
}

// Confirma el avatar seleccionado
const confirm = () => {
  if (props.disabled) return
  if (tempSelected.value == null) return

  emit('update:modelValue', tempSelected.value)
  emit('update:open', false)
  emit('close')
}
</script>

<template>
  <Modal
    :modelValue="open"
    @update:modelValue="(v) => emit('update:open', v)"
    size="auto"
    title="Elige tu imagen de usuario"
    :closeOnOverlay="false"
    :closeOnEsc="true"
    :hasCloseButton="true"
    :onCancel="closeModal"
    :onSubmit="confirm"
    submitText="Aceptar"
    cancelText="Cancelar"
  >
    <div class="avatar-gallery" :style="gridStyle" role="list">
      <div class="avatar-gallery__grid">
        <button
          v-for="avatar in AVATARS"
          :key="avatar.id"
          type="button"
          class="cell"
          role="listitem"
          :class="{ selected: avatar.id === tempSelected, disabled }"
          :aria-pressed="avatar.id === tempSelected"
          :aria-label="`Previsualizar avatar ${avatar.id}`"
          :disabled="disabled"
          @click="preview(avatar.id)"
        >
          <Avatar
            :id="avatar.id"
            :alt="`Avatar ${avatar.id}`"
            size="lg"
            variant="square"
            decorative
          />
        </button>
      </div>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
@use './AvatarGallery.styles.scss';
</style>
