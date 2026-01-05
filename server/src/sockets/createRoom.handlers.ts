import { SOCKET_EVENTS, type CreateRoomPayload } from '@pdt/shared'
import type { Server, Socket } from 'socket.io'
import { createRoom } from '../state/rooms.store.js'

export function registerCreateRoomHandler(io: Server, socket: Socket) {
  socket.on(SOCKET_EVENTS.CREATE_ROOM, (payload: CreateRoomPayload, ack) => {
    try {
      const { username, avatarId } = payload
      if (!username?.trim()) return ack?.({ ok: false, error: 'UNKNOWN' })
      if (typeof avatarId !== 'number') return ack?.({ ok: false, error: 'UNKNOWN' })

      const { roomId } = createRoom()
      ack?.({ ok: true, roomId })
    } catch {
      ack?.({ ok: false, error: 'UNKNOWN' })
    }
  })
}
