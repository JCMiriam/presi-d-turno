<script setup lang="ts">
import { computed } from 'vue'
import { Modal, Avatar } from '@components'

type Mode = 'create' | 'join'

const props = defineProps<{
  username: string
  avatarId: number
  error: string | null
  mode: Mode
  roomId: string | null
  submitLabel: string
}>()

const emit = defineEmits<{
  (e: 'update:username', value: string): void
  (e: 'submit'): void
  (e: 'avatarClick'): void
}>()

const open = computed(() => true) // siempre abierto (literalmente)

const title = computed(() => (props.mode === 'join' ? 'Unirse a la sala' : 'Crear sala'))
const subtitle = computed(() => {
  if (props.mode === 'join') return props.roomId ? `Sala: ${props.roomId}` : 'Accediendo por invitación…'
  return 'Elige un nombre y una imagen'
})

const onInput = (e: Event) => {
  emit('update:username', (e.target as HTMLInputElement).value)
}

const submit = () => emit('submit')
const avatarClick = () => emit('avatarClick')

// para que NO se cierre nunca desde el Modal
const noopCancel = () => {}
</script>

<template>
  <Modal
    :modelValue="open"
    size="md"
    :title="title"
    :subtitle="subtitle"
    :hasCloseButton="false"
    :closeOnOverlay="false"
    :closeOnEsc="false"
    :onCancel="noopCancel"
    :onSubmit="submit"
    :submitText="submitLabel"
  >
    <div class="create-user-modal">
      <button type="button" class="create-user-modal__avatar" @click="avatarClick" aria-label="Cambiar avatar">
        <Avatar :id="avatarId" alt="Tu avatar" size="lg" variant="square" decorative />
      </button>

      <label class="create-user-modal__label" for="username">Nombre de usuario</label>
      <input
        id="username"
        class="create-user-modal__input"
        type="text"
        :value="username"
        autocomplete="off"
        maxlength="18"
        placeholder="Escribe tu nombre…"
        @input="onInput"
        @keydown.enter.prevent="submit"
      />

      <p v-if="error" class="create-user-modal__error" role="alert">{{ error }}</p>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.create-user-modal {
  display: grid;
  gap: 16px;
}

.create-user-modal__avatar {
  justify-self: center;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
}

.create-user-modal__label {
  font-size: 14px;
  opacity: 0.9;
}

.create-user-modal__input {
  width: 100%;
}

.create-user-modal__error {
  font-size: 13px;
}
</style>
