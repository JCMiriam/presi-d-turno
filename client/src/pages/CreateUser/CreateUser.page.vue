<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { socket } from '@sockets/socket'
import { AVATARS } from '@data'

import { AvatarGallery } from './Components/AvatarGallery'
import { CreateUserModal } from './Components/CreateUserModal'
import { JoinWithIdModal } from './Components/JoinWithIdModal'

import { setUser } from '../../state/index'
import { SOCKET_EVENTS } from '@pdt/shared'
import { useRoomStore } from '@stores/room'

const route = useRoute()
const router = useRouter()
const roomStore = useRoomStore()

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

const isJoinWithIdOpen = ref(false)
const joinRoomId = ref('')
const joinError = ref<string | null>(null)
const isJoiningById = ref(false)

const userDraft = ref<null | {
  playerId: string
  playerToken: string
  username: string
  avatarId: number
}>(null)

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

  if (selectedAvatarId.value === null || selectedAvatarId.value === undefined) {
    error.value = '*Selecciona un avatar.'
    return false
  }

  error.value = null
  return true
}

function normalizeRoomId(input: string) {
  return input.trim().toUpperCase()
}

function buildOrReuseUserDraft() {
  const currentName = username.value.trim()
  const currentAvatarId = selectedAvatarId.value!

  if (userDraft.value) {
    userDraft.value.username = currentName
    userDraft.value.avatarId = currentAvatarId
    return userDraft.value
  }

  const created = {
    playerId: crypto.randomUUID(),
    playerToken: crypto.randomUUID(),
    username: currentName,
    avatarId: currentAvatarId,
  }

  userDraft.value = created
  return created
}

function persistSessionToRoomStore(user: {
  playerId: string
  playerToken: string
  username: string
  avatarId: number
}) {
  roomStore.setMyPlayerId(user.playerId)
  roomStore.setMyPlayerToken(user.playerToken)
  roomStore.setMyProfile({ username: user.username, avatarId: user.avatarId })
}

function openJoinWithIdModal() {
  joinError.value = null
  if (!validate() || isSubmitting.value || isJoiningById.value) return
  isJoinWithIdOpen.value = true
}

function closeJoinWithIdModal() {
  isJoinWithIdOpen.value = false
  joinError.value = null
}

function submitJoinWithId() {
  if (!validate() || isSubmitting.value || isJoiningById.value) return

  const roomId = normalizeRoomId(joinRoomId.value)

  if (!roomId) {
    joinError.value = 'Introduce un ID de sala.'
    return
  }

  isJoiningById.value = true
  joinError.value = null

  const user = buildOrReuseUserDraft()
  setUser(user)
  persistSessionToRoomStore(user)

  socket.emit(
    SOCKET_EVENTS.JOIN_ROOM,
    {
      roomId,
      playerId: user.playerId,
      playerToken: user.playerToken,
      username: user.username,
      avatarId: user.avatarId,
    },
    (res: any) => {
      isJoiningById.value = false

      if (!res || !res.ok) {
        joinError.value = res?.error ?? 'No existe esa sala (o no se pudo unir).'
        return
      }

      roomStore.roomId = roomId

      isJoinWithIdOpen.value = false

      router.push({
        name: 'lobby',
        query: {
          roomId,
          mode: 'join',
        },
      })
    },
  )
}

function onSubmit() {
  if (!validate() || isSubmitting.value || isJoiningById.value) return
  isSubmitting.value = true

  const user = buildOrReuseUserDraft()
  setUser(user)
  persistSessionToRoomStore(user)

  if (mode.value === 'create') {
    socket.emit(
      SOCKET_EVENTS.CREATE_ROOM,
      {
        username: user.username,
        avatarId: user.avatarId,
      },
      (res: any) => {
        isSubmitting.value = false

        if (!res || !res.ok) {
          error.value = 'No se pudo crear la sala. Inténtalo de nuevo.'
          return
        }

        roomStore.roomId = res.roomId

        router.push({
          name: 'lobby',
          query: {
            roomId: res.roomId,
            mode: 'create',
          },
        })
      },
    )
    return
  }

  const roomId = roomIdFromQuery.value?.trim().toUpperCase() ?? null
  if (!roomId) {
    isSubmitting.value = false
    error.value = 'El enlace de sala no es válido.'
    return
  }

  socket.emit(
    SOCKET_EVENTS.JOIN_ROOM,
    {
      roomId,
      playerId: user.playerId,
      playerToken: user.playerToken,
      username: user.username,
      avatarId: user.avatarId,
    },
    (res: any) => {
      isSubmitting.value = false

      if (!res || !res.ok) {
        error.value = res?.error ?? 'No existe esa sala (o no se pudo unir).'
        return
      }

      roomStore.roomId = roomId

      router.push({
        name: 'lobby',
        query: {
          roomId,
          mode: 'join',
        },
      })
    },
  )
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
      @joinWithId="openJoinWithIdModal"
    />

    <JoinWithIdModal
      v-model:roomId="joinRoomId"
      :open="isJoinWithIdOpen"
      :error="joinError"
      :isSubmitting="isJoiningById"
      @submit="submitJoinWithId"
      @cancel="closeJoinWithIdModal"
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
