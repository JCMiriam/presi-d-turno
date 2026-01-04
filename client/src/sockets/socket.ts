import { io, type Socket } from 'socket.io-client'
import type { ClientToServerEvents, ServerToClientEvents } from '@pdt/shared'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

declare global {
  var __PDT_SOCKET__: Socket<ServerToClientEvents, ClientToServerEvents> | undefined
}

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> =
  globalThis.__PDT_SOCKET__ ??
  (globalThis.__PDT_SOCKET__ = io(SERVER_URL, {
    autoConnect: true,
    transports: ['websocket'],
  }))

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    socket.removeAllListeners()
  })
}
