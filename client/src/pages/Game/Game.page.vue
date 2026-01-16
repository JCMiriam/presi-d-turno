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
import { usePlayersPanelStore } from '@stores/playersPanel'

import { CardCarousel, AnswerCard, Button } from '@components'

type AnswerCardT = { id: string; text: string }

const router = useRouter()
const roomStore = useRoomStore()
const handStore = useHandStore()

const playersPanel = usePlayersPanelStore()

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
    return
  }

  const payload: JoinRoomPayload = {
    roomId,
    playerId: myPlayerId,
    playerToken: myPlayerToken,
    username: myUsername,
    avatarId: myAvatarId,
  }

  socket.emit(SOCKET_EVENTS.JOIN_ROOM, payload, (res: JoinRoomAck) => {
    if (!res?.ok) {
      errorMsg.value = `REJOIN_${res?.error ?? 'UNKNOWN'}`
      return
    }
    if (errorMsg.value?.startsWith('REJOIN_')) errorMsg.value = null
  })
}

function handleRoomState(snapshot: RoomState) {
  const prevRound = roomStore.round

  roomStore.applySnapshot(snapshot)

  if (snapshot.round !== prevRound) {
    selectedId.value = null
    hasSubmitted.value = false
    pickedSubmissionId.value = null
    errorMsg.value = null
  }

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

  rejoinRoomIfPossible()

  socket.on('connect', rejoinRoomIfPossible)

  playersPanel.mount('#lobby-players-panel-slot', 'lobby-modal', true)
})

onBeforeUnmount(() => {
  socket.off(SOCKET_EVENTS.ROOM_STATE, handleRoomState)
  socket.off(SOCKET_EVENTS.HAND_STATE, handleHandState)
  socket.off('connect', rejoinRoomIfPossible)
  playersPanel.unmount()
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
      if (!res?.ok) return
      pickedSubmissionId.value = null
    },
  )
}
</script>

<template>
  <main class="container">
    <div class="game-page">
      <h4 class="game-page__title">#{{ roomStore.roomId }} - Ronda {{ roomStore.round }}</h4>

      <section v-if="roomStore.currentQuestionText" class="game-page__question">
        <AnswerCard :text="roomStore.currentQuestionText"></AnswerCard>
      </section>

      <p v-if="errorMsg" style="margin-top: 8px; color: #ffb3b3">Error: {{ errorMsg }}</p>

      <section v-if="isPresi" class="game-page__answers-list">
        <h3>Cartas jugadas</h3>

        <p v-if="submissions.length === 0">Esperando cartas…</p>

        <div v-else class="game-page__answers-list--list">
          <AnswerCard
            v-for="s in submissions"
            :key="s.id"
            :id="s.id"
            :text="s.text"
            :selected="pickedSubmissionId === s.id"
            @toggle="({ id }) => pickSubmission(id)"
          />
        </div>

        <Button
          class="game-page__winner-card-btn"
          text="Elegir ganadora"
          size="full"
          variant="primary"
          appearance="solid"
          color="pure-white"
          :disabled="!pickedSubmissionId"
          @click="confirmWinner"
        ></Button>
      </section>

      <section v-else class="game-page__player-cards">
        <p v-if="myHandCards.length === 0" style="opacity: 0.8">Cargando mano…</p>

        <CardCarousel
          v-else
          :cards="myHandCards"
          :selectedId="selectedId"
          :disabled="hasSubmitted"
          @toggle="onToggle"
        />

        <Button
          text="Jugar carta"
          size="full"
          variant="primary"
          appearance="solid"
          color="pure-white"
          :disabled="!canPlay"
          @click="playSelectedCard"
        ></Button>

        <p v-if="hasSubmitted" style="margin-top: 8px; opacity: 0.8">
          Carta enviada. Esperando al presi…
        </p>
      </section>

      <section class="game-page__players-list">
        <div id="lobby-players-panel-slot"></div>
      </section>
    </div>
  </main>
</template>

<style lang="scss" scoped>
@use './Game.styles.scss';
</style>
