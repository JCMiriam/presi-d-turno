<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { socket } from '@sockets/socket'
import { SOCKET_EVENTS, type HandStatePayload, type RoomState } from '@pdt/shared'

import { useRoomStore } from '@stores/room'
import { useHandStore } from '@stores/hand'

const router = useRouter()
const roomStore = useRoomStore()
const handStore = useHandStore()

function handleRoomState(snapshot: RoomState) {
  roomStore.applySnapshot(snapshot)

  if (snapshot.status === 'lobby') {
    router.replace({ name: 'lobby', query: { roomId: snapshot.roomId } })
  }
}

function handleHandState(payload: HandStatePayload) {
  if (roomStore.roomId && payload.roomId !== roomStore.roomId) return
  handStore.setHand({ hand: payload.hand, version: payload.version })
}

onMounted(() => {
  socket.on(SOCKET_EVENTS.ROOM_STATE, handleRoomState)
  socket.on(SOCKET_EVENTS.HAND_STATE, handleHandState)
})

onBeforeUnmount(() => {
  socket.off(SOCKET_EVENTS.ROOM_STATE, handleRoomState)
  socket.off(SOCKET_EVENTS.HAND_STATE, handleHandState)
})
</script>

<template>
  <main style="padding: 16px">
    <h2>Partida · {{ roomStore.roomId }} · ronda {{ roomStore.round }}</h2>

    <ul>
      <li v-for="card in handStore.hand" :key="card.id">- {{ card.text }}</li>
    </ul>
  </main>
</template>
