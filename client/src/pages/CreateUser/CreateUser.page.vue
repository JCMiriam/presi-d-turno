<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { socket } from '@sockets/socket'
import { AVATARS } from '@data'

import { AvatarGallery } from './Components/AvatarGallery'
import { CreateUserModal } from './Components/CreateUserModal'

import { setUser } from '../../state/index'

import { SOCKET_EVENTS } from '@pdt/shared'

const route = useRoute()
const router = useRouter()

const roomIdFromQuery = computed(() => {
  const value = route.query.roomId
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null
})

const mode = computed<'create' | 'join'>(() => (roomIdFromQuery.value ? 'join' : 'create'))
const submitLabel = computed(() => (mode.value === 'join' ? 'Unirse a la sala' : 'Crear sala'))

const username = ref('')
const selectedAvatarId = ref<number | null>(null)
const error = ref<string | null>(null)
const isGalleryOpen = ref(false)

const isSubmitting = ref(false)

const getRandomAvatarID = (): number => {
  const randomIndex = Math.floor(Math.random() * AVATARS.length)
  return AVATARS[randomIndex]!.id
}

onMounted(() => {
  if (selectedAvatarId.value == null) {
    selectedAvatarId.value = getRandomAvatarID()
  }
})

function validate(): boolean {
  const name = username.value.trim()

  if (!name) {
    error.value = '*Introduce un nombre de usuario.'
    return false
  }

  if (name.length > 18) {
    error.value = '*El nombre no puede tener más de 18 caracteres.'
    return false
  }

  if (!selectedAvatarId.value) {
    error.value = '*Selecciona un avatar.'
    return false
  }

  error.value = null
  return true
}

function onSubmit() {
  if (!validate() || isSubmitting.value) return

  isSubmitting.value = true

  const user = {
    username: username.value.trim(),
    avatarId: selectedAvatarId.value!,
  }

  setUser(user)

  if (mode.value === 'create') {
    socket.emit(SOCKET_EVENTS.CREATE_ROOM, user, (res) => {
      isSubmitting.value = false

      if (!res || !res.ok) {
        error.value = 'No se pudo crear la sala. Inténtalo de nuevo.'
        return
      }

      router.push({
        name: 'lobby',
        query: {
          roomId: res.roomId,
          mode: 'create',
        },
      })
    })
    return
  }

  const roomId = roomIdFromQuery.value?.trim().toUpperCase() ?? null
  if (!roomId) {
    isSubmitting.value = false
    error.value = 'El enlace de sala no es válido.'
    return
  }

  socket.emit(SOCKET_EVENTS.JOIN_ROOM, { roomId, ...user }, (res) => {
    isSubmitting.value = false

    if (!res || !res.ok) {
      error.value =
        res?.error === 'ROOM_NOT_FOUND'
          ? 'Esa sala no existe (o ya ha caducado).'
          : res?.error === 'ROOM_ID_INVALID'
            ? 'El id de la sala no es válido.'
            : 'No se pudo unir a la sala. Inténtalo de nuevo.'
      return
    }

    router.push({
      name: 'lobby',
      query: {
        roomId,
        mode: 'join',
      },
    })
  })
}

function openGallery() {
  isGalleryOpen.value = true
}

function closeGallery() {
  isGalleryOpen.value = false
}
</script>

<template>
  <main class="create-user">
    <CreateUserModal
      v-model:username="username"
      :avatar-id="selectedAvatarId ?? 0"
      :error="error"
      :mode="mode"
      :room-id="roomIdFromQuery"
      :submit-label="submitLabel"
      @submit="onSubmit"
      @avatarClick="openGallery"
    />

    <AvatarGallery
      v-model="selectedAvatarId"
      v-model:open="isGalleryOpen"
      :size="'lg'"
      :disabled="false"
      @close="closeGallery"
    />
  </main>
</template>

<style scoped lang="scss"></style>
