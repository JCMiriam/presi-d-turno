<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { socket } from '@sockets/socket'
import {
  SOCKET_EVENTS,
  type RoomState,
  type JoinRoomPayload,
  type HandStatePayload,
} from '@pdt/shared'

import { userState, hydrateUserFromStorage, touchUserSession } from '../../state'
import { useRoomStore } from '@stores/room'
import { usePlayersPanelStore } from '@stores/playersPanel'
import { useHandStore } from '@stores/hand'

import { useBreakpoint } from '@composables'

import { Button } from '@components'
import { RoundsSelector } from './Components/RoundsSelector'

const inviteStatus = ref<'idle' | 'copied' | 'error'>('idle')
const route = useRoute()
const router = useRouter()
const roomStore = useRoomStore()
const playersPanel = usePlayersPanelStore()
const handStore = useHandStore()

const { isAbove } = useBreakpoint()

const hasJoined = ref(false)

const roomId = computed<string | null>(() => {
  const r = route.query.roomId
  return typeof r === 'string' && r.trim() ? r.trim().toUpperCase() : null
})

const inviteUrl = computed(() => {
  const id = roomStore.roomId ?? roomId.value ?? ''
  const base = window.location.origin
  return `${base}/?roomId=${encodeURIComponent(id)}`
})

const isHost = computed(() => roomStore.hostId === roomStore.myEffectiveId)

const roundsOptions = [3, 5, 7, 10, 15, 20]

function updateRounds(value: number) {
  if (!isHost.value) return
  if (!roomStore.roomId) return
  if (roomStore.status !== 'lobby') return

  socket.emit(
    SOCKET_EVENTS.UPDATE_ROOM_SETTINGS,
    {
      roomId: roomStore.roomId,
      roundsToWin: value,
    },
    (res) => {
      if (!res?.ok) {
        console.warn('update_room_settings failed:', res?.error)
      }
    },
  )
}

async function copyInviteLink() {
  try {
    await navigator.clipboard.writeText(inviteUrl.value)
    inviteStatus.value = 'copied'
    window.setTimeout(() => (inviteStatus.value = 'idle'), 1500)
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = inviteUrl.value
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)

      inviteStatus.value = 'copied'
      window.setTimeout(() => (inviteStatus.value = 'idle'), 1500)
    } catch {
      inviteStatus.value = 'error'
      window.setTimeout(() => (inviteStatus.value = 'idle'), 2000)
    }
  }
}

function startMatch() {
  if (!isHost.value) return
  if (!roomStore.roomId) return
  if (roomStore.status !== 'lobby') return

  socket.emit(SOCKET_EVENTS.START_GAME, { roomId: roomStore.roomId }, (res) => {
    if (!res?.ok) {
      console.warn('start_game failed:', res?.error)
    }
  })
}

function handleRoomState(snapshot: RoomState) {
  roomStore.applySnapshot(snapshot)
}

function joinRoom() {
  if (!userState.user) return
  if (!roomId.value) return
  if (hasJoined.value) return

  hasJoined.value = true

  const payload: JoinRoomPayload = {
    roomId: roomId.value,
    playerId: userState.user.playerId,
    playerToken: userState.user.playerToken,
    username: userState.user.username,
    avatarId: userState.user.avatarId,
  }

  socket.emit(SOCKET_EVENTS.JOIN_ROOM, payload)
}

function handleConnect() {
  if (socket.id) roomStore.setMySocketId(socket.id)
  if (userState.user) roomStore.setMyPlayerId(userState.user.playerId)
  joinRoom()
}

function handleHandState(payload: HandStatePayload) {
  if (roomStore.roomId && payload.roomId !== roomStore.roomId) return

  handStore.setHand({ hand: payload.hand, version: payload.version })
}

onMounted(() => {
  hydrateUserFromStorage()

  if (!userState.user) {
    router.replace({
      name: 'user-setup',
      query: route.query.roomId ? { roomId: String(route.query.roomId) } : {},
    })
    return
  }

  if (!roomId.value) {
    router.replace({ name: 'user-setup' })
    return
  }

  touchUserSession({ lastRoomId: roomId.value })

  playersPanel.mount('#lobby-players-panel-slot', 'lobby-modal', true)

  socket.on(SOCKET_EVENTS.ROOM_STATE, handleRoomState)
  socket.on('connect', handleConnect)

  if (socket.connected) handleConnect()

  socket.on(SOCKET_EVENTS.HAND_STATE, handleHandState)
})

onBeforeUnmount(() => {
  hasJoined.value = false
  socket.off(SOCKET_EVENTS.ROOM_STATE, handleRoomState)
  socket.off('connect', handleConnect)
  playersPanel.unmount()
  socket.off(SOCKET_EVENTS.HAND_STATE, handleHandState)
})

watch(
  () => roomStore.status,
  (s) => {
    if (s === 'in_game') {
      router.push({ name: 'game', query: { roomId: roomStore.roomId! } })
    }
  },
)
</script>

<template>
  <main class="container">
    <div class="lobby">
      <section class="lobby__players">
        <RoundsSelector
          v-if="!isAbove('lg').value"
          :label="isHost ? 'Seleccionar número de rondas' : 'Número de rondas:'"
          :options="roundsOptions"
          :disabled="!isHost || roomStore.status !== 'lobby'"
          :model-value="roomStore.roundsToWin"
          @update:modelValue="updateRounds"
          hint="Esto define cuántas rondas necesita ganar alguien para terminar la partida."
        ></RoundsSelector>

        <div id="lobby-players-panel-slot"></div>
      </section>

      <section class="lobby__buttons">
        <Button
          size="full"
          :text="
            inviteStatus === 'copied'
              ? 'Link copiado al portapapeles'
              : inviteStatus === 'error'
                ? 'No se ha podido copiar'
                : 'Invitar jugadores'
          "
          variant="success"
          appearance="solid"
          @click="copyInviteLink"
        ></Button>

        <Button
          size="full"
          text="Empezar partida"
          variant="primary"
          appearance="solid"
          :disabled="!isHost"
          @click="startMatch"
        ></Button>

        <RoundsSelector
          v-if="isAbove('lg').value"
          :label="isHost ? 'Seleccionar número de rondas' : 'Número de rondas:'"
          :options="roundsOptions"
          :disabled="!isHost || roomStore.status !== 'lobby'"
          :model-value="roomStore.roundsToWin"
          @update:modelValue="updateRounds"
        ></RoundsSelector>
      </section>
    </div>
  </main>
</template>

<style scoped lang="scss">
@use './Lobby.styles.scss';
</style>
