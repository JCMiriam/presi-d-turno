import { SOCKET_EVENTS, type CreateRoomPayload } from '@pdt/shared'
import type { Server, Socket } from 'socket.io'
import { createRoom } from '../state/rooms.store.js'

export function registerCreateRoomHandler(io: Server, socket: Socket) {
  socket.on(SOCKET_EVENTS.CREATE_ROOM, (payload: CreateRoomPayload, ack) => {
    try {
      const username = payload.username?.trim()
      const avatarId = payload.avatarId

      if (!username) return ack?.({ ok: false, error: 'UNKNOWN' })
      if (typeof avatarId !== 'number' || !Number.isFinite(avatarId)) {
        return ack?.({ ok: false, error: 'UNKNOWN' })
      }

      const { roomId } = createRoom()
      ack?.({ ok: true, roomId })
    } catch {
      ack?.({ ok: false, error: 'UNKNOWN' })
    }
  })
}
