<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { socket } from '@sockets/socket'
import { SOCKET_EVENTS, type RoomState, type JoinRoomPayload } from '@pdt/shared'

import { userState } from '../../state/index'
import { useRoomStore } from '@stores/room'
import { usePlayersPanelStore } from '@stores/playersPanel'

import { Button } from '@components'

const inviteStatus = ref<'idle' | 'copied' | 'error'>('idle')
const route = useRoute()
const router = useRouter()
const roomStore = useRoomStore()
const playersPanel = usePlayersPanelStore()

const roomId = computed<string | null>(() => {
  const r = route.query.roomId
  return typeof r === 'string' && r.trim() ? r.trim().toUpperCase() : null
})

const inviteUrl = computed(() => {
  const id = roomStore.roomId ?? roomId.value ?? ''
  const base = window.location.origin
  return `${base}/?roomId=${encodeURIComponent(id)}`
})

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

const hasJoined = ref(false)

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
    username: userState.user.username,
    avatarId: userState.user.avatarId,
  }

  socket.emit(SOCKET_EVENTS.JOIN_ROOM, payload)
}

function handleConnect() {
  if (socket.id) roomStore.setMyId(socket.id)
  joinRoom()
}

onMounted(() => {
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
    <header class="header">
      <Button
        :text="inviteStatus === 'copied' ? 'Link copiado al portapapeles' : inviteStatus === 'error' ? 'No se ha podido copiar' : 'Invitar jugadores'"
        variant="primary"
        appearance="solid"
        @click="copyInviteLink"
      ></Button>
    </header>

    <div id="lobby-players-panel-slot"></div>

  </main>
</template>

<style scoped lang="scss">
@import './Lobby.styles.scss';
</style>
