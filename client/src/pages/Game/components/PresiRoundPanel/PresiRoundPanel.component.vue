<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoomStore } from '@stores/room'
import { socket } from '@sockets/socket'
import { SOCKET_EVENTS } from '@pdt/shared'
import { AnswerCard } from '@components'

const room = useRoomStore()
const pickedSubmissionId = ref<string | null>(null)

const submissions = computed(() => room.roundSubmissions ?? [])

function pick(id: string) {
  pickedSubmissionId.value = id
}

function confirmWinner() {
  if (!pickedSubmissionId.value) return
  if (!room.roomId) return

  socket.emit(
    SOCKET_EVENTS.PICK_WINNER,
    {
      roomId: room.roomId,
      submissionId: pickedSubmissionId.value,
    },
    (res: any) => {
      if (!res?.ok) return
      pickedSubmissionId.value = null
    },
  )
}
</script>

<template>
  <div class="presi-panel">
    <h3>Cartas jugadas</h3>

    <div v-if="submissions.length === 0" class="presi-panel__empty">
      Esperando cartas…
    </div>

    <div v-else class="presi-panel__list">
      <AnswerCard
        v-for="s in submissions"
        :key="s.id"
        :id="s.id"
        :text="s.text"
        :selected="pickedSubmissionId === s.id"
        @toggle="({ id }) => pick(id)"
      ></AnswerCard>
    </div>

    <button
      class="presi-panel__cta"
      :disabled="!pickedSubmissionId"
      @click="confirmWinner"
    >
      Elegir ganadora
    </button>
  </div>
</template>
