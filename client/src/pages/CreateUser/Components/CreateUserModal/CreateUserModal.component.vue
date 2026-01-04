<script setup lang="ts">
import { computed } from 'vue'
import { Modal, Avatar, Icon } from '@components'

import type { CreateUserModalProps } from './CreateUserModal.types'

const props = defineProps<CreateUserModalProps>()

const emit = defineEmits<{
  (e: 'update:username', value: string): void
  (e: 'submit'): void
  (e: 'avatarClick'): void
}>()

const open = computed(() => true)

const title = computed(() => {
  if (props.mode === 'join') return props.roomId ? `#${props.roomId}` : 'Accediendo por invitación…'
  return 'Elige un nombre y una imagen'
})

const subtitle = computed(() => {
  if (props.mode === 'join') return props.roomId ? `ID de la partida` : 'Accediendo por invitación…'
  return 'Elige un nombre y una imagen'
})

const onInput = (e: Event) => {
  emit('update:username', (e.target as HTMLInputElement).value)
}

const submit = () => emit('submit')
const avatarClick = () => emit('avatarClick')
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
    :onSubmit="submit"
    :submitText="submitLabel"
  >
    <div class="create-user-modal">
      <button
        type="button"
        class="create-user-modal__avatar"
        @click="avatarClick"
        aria-label="Cambiar avatar"
      >
        <Avatar :id="avatarId" alt="Tu avatar" size="xl" decorative />
        <div class="create-user-modal__avatar__edit-button">
          <Icon icon="pencil" :size="20" color="pure-white"></Icon>
        </div>
      </button>

      <div class="create-user-modal__content">
        <div class="create-user-modal__content__username">
          <label class="create-user-modal__content__label" for="username">Nombre de usuario</label>
          <input
            id="username"
            class="create-user-modal__content__input"
            type="text"
            :value="username"
            autocomplete="off"
            maxlength="18"
            placeholder="Escribe tu nombre de usuario"
            @input="onInput"
            @keydown.enter.prevent="submit"
          />
          <span v-if="error" class="create-user-modal__content__error" role="alert">{{
            error
          }}</span>
        </div>

        <div class="create-user-modal__info">
          <h4>¡Hey, cuidado al elegir tu nombre de usuario!</h4>
          <p>
            Ten en cuenta que se usará para mencionarte aleatoriamente en algunas cartas, así que
            necesitamos que tus amigos te reconozcan... No queremos que piensen que RataLujosa42 ha
            invadido la partida.
          </p>
        </div>
      </div>
    </div>
  </Modal>
</template>

<style lang="scss">
@use './CreateUserModal.styles.scss';
</style>
