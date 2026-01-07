<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { socket } from '@sockets/socket'
import { SOCKET_EVENTS, decks, type HandStatePayload, type RoomState } from '@pdt/shared'

import { useRoomStore } from '@stores/room'
import { useHandStore } from '@stores/hand'

const route = useRoute()
const router = useRouter()
const roomStore = useRoomStore()
const handStore = useHandStore()

const roomId = computed(() => {
  const r = route.query.roomId
  return typeof r === 'string' && r.trim() ? r.trim().toUpperCase() : null
})

function answerTextFromId(id: string): string {
  const n = Number(id.replace('a-', ''))
  return Number.isFinite(n) ? (decks.answers[n] ?? id) : id
}

function handleRoomState(snapshot: RoomState) {
  roomStore.applySnapshot(snapshot)

  // Si alguien vuelve al lobby, redirige
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
  <main style="padding: 16px;">
    <h2>Partida · {{ roomStore.roomId }} · ronda {{ roomStore.round }}</h2>
    <p>Status: {{ roomStore.status }}</p>

    <h3>Tu mano ({{ handStore.hand.length }})</h3>
    <ul>
      <li v-for="id in handStore.hand" :key="id">
        {{ answerTextFromId(id) }}
        <small style="opacity:0.6;">({{ id }})</small>
      </li>
    </ul>
  </main>
</template>
