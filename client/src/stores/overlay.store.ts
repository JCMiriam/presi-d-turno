// client/src/stores/overlay.store.ts
import { defineStore } from 'pinia'

export type OverlayOptions = {
  blur?: number
  opacity?: number
  zIndex?: number
  closeOnClick?: boolean
  lockScroll?: boolean
  ariaLabel?: string
  ownerId?: string | null
}

const DEFAULTS: Required<Omit<OverlayOptions, 'ownerId'>> = {
  blur: 10,
  opacity: 0.35,
  zIndex: 2000,
  closeOnClick: true,
  lockScroll: true,
  ariaLabel: 'Overlay',
}

export const useOverlayStore = defineStore('overlay', {
  state: () => ({
    isOpen: false,
    ownerId: null as string | null, // ✅ IMPORTANTÍSIMO
    options: DEFAULTS,
  }),

  actions: {
    open(opts?: OverlayOptions) {
      this.options = { ...DEFAULTS, ...(opts ?? {}) }
      this.ownerId = opts?.ownerId ?? null // ✅ IMPORTANTÍSIMO
      this.isOpen = true
    },

    close() {
      this.isOpen = false
      this.ownerId = null
      this.options = DEFAULTS
    },
  },
})
