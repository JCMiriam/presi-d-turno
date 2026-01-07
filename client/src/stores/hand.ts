import { defineStore } from 'pinia'
import type { HandCard } from '@pdt/shared'

export const useHandStore = defineStore('hand', {
  state: () => ({
    hand: [] as HandCard[],
    version: 0,
  }),
  actions: {
    setHand(payload: { hand: HandCard[]; version: number }) {
      this.hand = payload.hand
      this.version = payload.version
    },
    reset() {
      this.hand = []
      this.version = 0
    },
  },
})
