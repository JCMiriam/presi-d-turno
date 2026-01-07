import { defineStore } from 'pinia'

export type CardId = string

export const useHandStore = defineStore('hand', {
  state: () => ({
    hand: [] as CardId[],
    version: 0,
  }),
  actions: {
    setHand(payload: { hand: CardId[]; version: number }) {
      this.hand = payload.hand
      this.version = payload.version
    },
    reset() {
      this.hand = []
      this.version = 0
    },
  },
})
