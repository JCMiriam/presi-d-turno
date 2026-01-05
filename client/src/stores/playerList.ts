import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useRoomStore } from './room'

export type PlayerSortMode = 'points' | 'alphabetical'

export const usePlayerListStore = defineStore('playerlist', () => {
  const roomStore = useRoomStore()
  const sortMode = ref<PlayerSortMode>('points')
  const highlightLeader = ref(true)

  const players = computed(() => {
    const list = [...roomStore.players]

    switch (sortMode.value) {
      case 'alphabetical':
        return list.sort((a, b) => a.username.localeCompare(b.username))

      case 'points':
      default:
        return list.sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points
          return a.username.localeCompare(b.username)
        })
    }
  })

  const leader = computed(() => players.value[0] ?? null)

  const myPlayer = computed(() => roomStore.players.find((p) => p.id === roomStore.myId) ?? null)

  return {
    sortMode,
    highlightLeader,
    players,
    leader,
    myPlayer,
  }
})
