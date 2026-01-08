<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { socket } from '@sockets/socket'
import {
  SOCKET_EVENTS,
  type HandStatePayload,
  type RoomState,
  type JoinRoomAck,
  type JoinRoomPayload,
} from '@pdt/shared'

import { useRoomStore } from '@stores/room'
import { useHandStore } from '@stores/hand'

import { CardCarousel, AnswerCard } from '@components'

type AnswerCardT = { id: string; text: string }

const router = useRouter()
const roomStore = useRoomStore()
const handStore = useHandStore()

const selectedId = ref<string | null>(null)
const hasSubmitted = ref(false)
const pickedSubmissionId = ref<string | null>(null)
const errorMsg = ref<string | null>(null)

const myHandCards = computed<AnswerCardT[]>(() => {
  const raw = (handStore.hand ?? []) as unknown[]
  return raw.filter(
    (x): x is AnswerCardT =>
      typeof x === 'object' &&
      x !== null &&
      'id' in (x as any) &&
      'text' in (x as any) &&
      typeof (x as any).id === 'string' &&
      typeof (x as any).text === 'string',
  )
})

watch(
  () => handStore.version,
  () => {
    selectedId.value = null
    errorMsg.value = null
  },
)

function rejoinRoomIfPossible() {
  const { roomId, myPlayerId, myPlayerToken, myUsername, myAvatarId } = roomStore

  if (
    !roomId ||
    !myPlayerId ||
    !myPlayerToken ||
    !myUsername ||
    myAvatarId === null ||
    myAvatarId === undefined
  ) {
    console.log('[GAME] rejoin skipped (missing join payload)', {
      roomId,
      myPlayerId,
      hasToken: Boolean(myPlayerToken),
      myUsername,
      myAvatarId,
      socketId: socket.id,
    })
    return
  }

  const payload: JoinRoomPayload = {
    roomId,
    playerId: myPlayerId,
    playerToken: myPlayerToken,
    username: myUsername,
    avatarId: myAvatarId,
  }

  console.log('[GAME] rejoin -> join_room', {
    roomId,
    playerId: myPlayerId,
    username: myUsername,
    avatarId: myAvatarId,
    socketId: socket.id,
  })

  socket.emit(SOCKET_EVENTS.JOIN_ROOM, payload, (res: JoinRoomAck) => {
    console.log('[GAME] rejoin ack', res)
    if (!res?.ok) {
      errorMsg.value = `REJOIN_${res?.error ?? 'UNKNOWN'}`
      return
    }
    if (errorMsg.value?.startsWith('REJOIN_')) errorMsg.value = null
  })
}

function handleRoomState(snapshot: RoomState) {
  const prevRound = roomStore.round

  console.log('[ROOM_STATE] incoming', {
    roomId: snapshot.roomId,
    version: snapshot.version,
    status: snapshot.status,
    round: snapshot.round,
    presiId: snapshot.presiId,
    requiredAnswers: snapshot.requiredAnswers,
    submissions: snapshot.roundSubmissions?.length ?? 0,
  })

  roomStore.applySnapshot(snapshot)

  if (snapshot.round !== prevRound) {
    console.log('[ROOM_STATE] round changed', { prevRound, nextRound: snapshot.round })
    selectedId.value = null
    hasSubmitted.value = false
    pickedSubmissionId.value = null
    errorMsg.value = null
  }

  if (snapshot.status === 'lobby') {
    console.log('[ROOM_STATE] back to lobby')
    router.replace({ name: 'lobby', query: { roomId: snapshot.roomId } })
  }
}

function handleHandState(payload: HandStatePayload) {
  console.log('[HAND_STATE] incoming', {
    roomId: payload.roomId,
    version: payload.version,
    handLen: payload.hand?.length ?? 0,
    first: payload.hand?.[0],
    firstType: typeof payload.hand?.[0],
  })

  if (roomStore.roomId && payload.roomId !== roomStore.roomId) {
    console.log('[HAND_STATE] ignored (different room)', {
      storeRoomId: roomStore.roomId,
      payloadRoomId: payload.roomId,
    })
    return
  }

  handStore.setHand({ hand: payload.hand, version: payload.version })
}

onMounted(() => {
  console.log('[GAME] mounted', {
    myPlayerId: roomStore.myPlayerId,
    mySocketId: roomStore.mySocketId,
    myEffectiveId: roomStore.myEffectiveId,
    socketId: socket.id,
  })

  socket.on(SOCKET_EVENTS.ROOM_STATE, handleRoomState)
  socket.on(SOCKET_EVENTS.HAND_STATE, handleHandState)

  rejoinRoomIfPossible()

  socket.on('connect', rejoinRoomIfPossible)
})

onBeforeUnmount(() => {
  console.log('[GAME] before unmount')
  socket.off(SOCKET_EVENTS.ROOM_STATE, handleRoomState)
  socket.off(SOCKET_EVENTS.HAND_STATE, handleHandState)
  socket.off('connect', rejoinRoomIfPossible)
})

function onToggle({ id, selected }: { id: string; selected: boolean }) {
  if (hasSubmitted.value) return
  selectedId.value = selected ? id : null
}

const myId = computed(() => roomStore.myEffectiveId)
const isPresi = computed(() => Boolean(myId.value) && roomStore.presiId === myId.value)

const submissions = computed(() => roomStore.roundSubmissions ?? [])

const canPlay = computed(() => {
  if (isPresi.value || hasSubmitted.value) return false
  if (!selectedId.value) return false
  return myHandCards.value.some((c) => c.id === selectedId.value)
})

function playSelectedCard() {
  errorMsg.value = null

  if (!selectedId.value) return
  if (hasSubmitted.value) return
  if (!roomStore.roomId) {
    errorMsg.value = 'NO_ROOM_ID'
    return
  }

  socket.emit(
    SOCKET_EVENTS.PLAY_ANSWERS,
    { roomId: roomStore.roomId, cardIds: [selectedId.value] },
    (res: any) => {
      console.log('[PLAY] ack', res)

      if (!res?.ok) {
        errorMsg.value = res?.error ?? 'UNKNOWN'
        return
      }

      hasSubmitted.value = true
      selectedId.value = null
    },
  )
}

function pickSubmission(id: string) {
  pickedSubmissionId.value = id
}

function confirmWinner() {
  if (!pickedSubmissionId.value) return
  if (!roomStore.roomId) return

  socket.emit(
    SOCKET_EVENTS.PICK_WINNER,
    { roomId: roomStore.roomId, submissionId: pickedSubmissionId.value },
    (res: any) => {
      console.log('[PRESI] PICK_WINNER ack', res)
      if (!res?.ok) return
      pickedSubmissionId.value = null
    },
  )
}
</script>

<template>
  <main style="padding: 16px">
    <p style="opacity: 0.75; margin-top: 8px">
      myEffectiveId={{ roomStore.myEffectiveId }} · presiId={{ roomStore.presiId }} · isPresi={{ isPresi }} ·
      hasSubmitted={{ hasSubmitted }} · required={{ roomStore.requiredAnswers }} · selectedId={{ selectedId }} ·
      canPlay={{ canPlay }} · submissions={{ submissions.length }} · handResolved={{ myHandCards.length }}
    </p>

    <section v-if="roomStore.currentQuestionText">
      <h3>Pregunta</h3>
      <p>{{ roomStore.currentQuestionText }}</p>
      <p><strong>Respuestas requeridas:</strong> {{ roomStore.requiredAnswers }}</p>
    </section>

    <h2>Partida · {{ roomStore.roomId }} · ronda {{ roomStore.round }}</h2>

    <p v-if="errorMsg" style="margin-top: 8px; color: #ffb3b3">Error: {{ errorMsg }}</p>

    <section v-if="isPresi" style="margin-top: 16px">
      <h3>Cartas jugadas</h3>

      <p v-if="submissions.length === 0">Esperando cartas…</p>

      <div v-else style="display: grid; gap: 12px">
        <AnswerCard
          v-for="s in submissions"
          :key="s.id"
          :id="s.id"
          :text="s.text"
          :selected="pickedSubmissionId === s.id"
          @toggle="({ id }) => pickSubmission(id)"
        />
      </div>

      <button style="margin-top: 12px" :disabled="!pickedSubmissionId" @click="confirmWinner">
        Elegir ganadora
      </button>
    </section>

    <section v-else style="margin-top: 16px">
      <p v-if="myHandCards.length === 0" style="opacity: 0.8">Cargando mano…</p>

      <CardCarousel
        v-else
        :cards="myHandCards"
        :selectedId="selectedId"
        :disabled="hasSubmitted"
        @toggle="onToggle"
      />

      <button style="margin-top: 12px" :disabled="!canPlay" @click="playSelectedCard">
        Jugar carta
      </button>

      <p v-if="hasSubmitted" style="margin-top: 8px; opacity: 0.8">
        Carta enviada. Esperando al presi…
      </p>
    </section>
  </main>
</template>
