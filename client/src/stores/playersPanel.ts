import { defineStore } from 'pinia'
import { ref } from 'vue'

export type PlayersPanelVariant = 'lobby-modal' | 'game-sidebar'

export const usePlayersPanelStore = defineStore('players-panel', () => {
  const target = ref<string>('body')
  const variant = ref<PlayersPanelVariant>('lobby-modal')
  const open = ref(false)

  function mount(to: string, v: PlayersPanelVariant, shouldOpen = true) {
    target.value = to
    variant.value = v
    open.value = shouldOpen
  }

  function unmount() {
    target.value = 'body'
    open.value = false
  }

  return { target, variant, open, mount, unmount }
})
