<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { socket } from '@sockets/socket'
import { SOCKET_EVENTS, type RoomState, type JoinRoomPayload } from '@pdt/shared'

import { userState, hydrateUserFromStorage, touchUserSession } from '../../state'
import { useRoomStore } from '@stores/room'
import { usePlayersPanelStore } from '@stores/playersPanel'

import { Button } from '@components'

const inviteStatus = ref<'idle' | 'copied' | 'error'>('idle')
const route = useRoute()
const router = useRouter()
const roomStore = useRoomStore()
const playersPanel = usePlayersPanelStore()

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

const roundsOptions = [3, 5, 7, 10]

function updateRounds(value: number) {
  if (!isHost.value) return
  if (!roomStore.roomId) return

  socket.emit(SOCKET_EVENTS.UPDATE_ROOM_SETTINGS, {
    roomId: roomStore.roomId,
    roundsToWin: value,
  })
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
})

onBeforeUnmount(() => {
  hasJoined.value = false
  socket.off(SOCKET_EVENTS.ROOM_STATE, handleRoomState)
  socket.off('connect', handleConnect)
  playersPanel.unmount()
})
</script>

<template>
  <main class="lobby">
    <div id="lobby-players-panel-slot"></div>
    <section v-if="isHost" class="lobby__settings">
      <label class="lobby__label">Seleccionar número de rondas</label>
      <select
        class="lobby__select"
        :disabled="!isHost || roomStore.status !== 'lobby'"
        :value="roomStore.roundsToWin"
        @change="updateRounds(Number(($event.target as HTMLSelectElement).value))"
      >
        <option v-for="r in roundsOptions" :key="r" :value="r">
          {{ r }}
        </option>
      </select>
    </section>
    <section>
      <Button
        :text="
          inviteStatus === 'copied'
            ? 'Link copiado al portapapeles'
            : inviteStatus === 'error'
              ? 'No se ha podido copiar'
              : 'Invitar jugadores'
        "
        variant="secondary"
        appearance="solid"
        @click="copyInviteLink"
      ></Button>
      <Button
        text="Empezar partida"
        variant="primary"
        appearance="solid"
        @click="copyInviteLink"
      ></Button>
    </section>
  </main>
</template>

<style scoped lang="scss">
@use './Lobby.styles.scss';
</style>
