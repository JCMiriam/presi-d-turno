<script setup lang="ts">
import { computed } from 'vue'
import { Modal } from '@components'
import type { JoinWithIdModalProps } from './JoinWithIdModal.types'

const props = defineProps<JoinWithIdModalProps>()

const emit = defineEmits<{
  (e: 'update:roomId', value: string): void
  (e: 'submit'): void
  (e: 'cancel'): void
}>()

const title = computed(() => 'Unirse con ID de sala')
const subtitle = computed(() => 'Escribe el ID que te pasaron (ej: A1B2C3)')

function onInput(e: Event) {
  emit('update:roomId', (e.target as HTMLInputElement).value)
}

function submit() {
  emit('submit')
}

function cancel() {
  emit('cancel')
}
</script>

<template>
  <Modal
    size="md"
    :modelValue="open"
    :title="title"
    :subtitle="subtitle"
    :hasCloseButton="false"
    :closeOnOverlay="false"
    :closeOnEsc="false"
    :onSubmit="submit"
    submitText="Unirse"
    :onCancel="cancel"
    cancelText="Cancelar"
    :isSubmitting="isSubmitting"
  >
    <div class="join-with-id">
      <label class="join-with-id__label" for="roomId">ID de sala</label>
      <input
        id="roomId"
        class="join-with-id__input"
        type="text"
        :value="roomId"
        autocomplete="off"
        inputmode="text"
        maxlength="12"
        placeholder="Introduce el ID"
        @input="onInput"
        @keydown.enter.prevent="submit"
      />

      <p v-if="error" class="join-with-id__error" role="alert">
        {{ error }}
      </p>

      <p class="join-with-id__hint">
        Tip: el ID suele ir en el enlace de invitación. No muerde (normalmente).
      </p>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
@use './JoinWithIdModal.styles.scss';
</style>
