import { SOCKET_EVENTS, type JoinRoomPayload, type UpdateRoomSettingsPayload } from '@pdt/shared'
import type { Server, Socket } from 'socket.io'
import type { ServerRoom } from '../types/index.js'
import { getRoom, toRoomState } from '../state/rooms.store.js'

const PURGE_AFTER_MS = 45_000

function bump(room: ServerRoom) {
  room.version += 1
}

export function registerRoomHandlers(io: Server, socket: Socket) {
  socket.on(SOCKET_EVENTS.JOIN_ROOM, (payload: JoinRoomPayload, ack) => {
    try {
      const roomId = payload.roomId?.trim().toUpperCase()
      if (!roomId) {
        ack?.({ ok: false, error: 'ROOM_ID_INVALID' })
        return
      }

      const room = getRoom(roomId)
      if (!room) {
        ack?.({ ok: false, error: 'ROOM_NOT_FOUND' })
        return
      }

      const { playerId, playerToken, username, avatarId } = payload
      if (!playerId || !playerToken || !username) {
        ack?.({ ok: false, error: 'UNKNOWN' })
        return
      }

      socket.join(roomId)

      const existing = room.playersById[playerId]

      if (existing) {
        if (existing.token !== playerToken) {
          ack?.({ ok: false, error: 'UNKNOWN' })
          return
        }

        if (existing.purgeTimer) clearTimeout(existing.purgeTimer)
        existing.purgeTimer = undefined

        existing.username = username
        existing.avatarId = avatarId

        existing.socketId = socket.id
        existing.connected = true
        existing.disconnectedAt = null

        socket.data.roomId = roomId
        socket.data.playerId = playerId

        bump(room)
        io.to(roomId).emit(SOCKET_EVENTS.ROOM_STATE, toRoomState(room))
        ack?.({ ok: true, roomId })
        return
      }

      room.playersById[playerId] = {
        id: playerId,
        token: playerToken,
        username,
        avatarId,
        points: 0,
        socketId: socket.id,
        connected: true,
        disconnectedAt: null,
      }

      if (!room.hostId) room.hostId = playerId
      if (!room.presiId) room.presiId = playerId

      socket.data.roomId = roomId
      socket.data.playerId = playerId

      bump(room)
      io.to(roomId).emit(SOCKET_EVENTS.ROOM_STATE, toRoomState(room))
      ack?.({ ok: true, roomId })
    } catch {
      ack?.({ ok: false, error: 'UNKNOWN' })
    }
  })

  socket.on(SOCKET_EVENTS.UPDATE_ROOM_SETTINGS, (payload: UpdateRoomSettingsPayload, ack) => {
    try {
      const roomId = payload.roomId?.trim().toUpperCase()
      const roundsToWin = payload.roundsToWin

      if (!roomId || typeof roundsToWin !== 'number' || !Number.isFinite(roundsToWin)) {
        ack?.({ ok: false, error: 'INVALID_SETTINGS' })
        return
      }

      const socketRoomId = socket.data.roomId as string | undefined
      const socketPlayerId = socket.data.playerId as string | undefined

      if (!socketRoomId || !socketPlayerId || socketRoomId !== roomId) {
        ack?.({ ok: false, error: 'UNKNOWN' })
        return
      }

      const room = getRoom(roomId)
      if (!room) {
        ack?.({ ok: false, error: 'ROOM_NOT_FOUND' })
        return
      }

      if (room.hostId !== socketPlayerId) {
        ack?.({ ok: false, error: 'NOT_HOST' })
        return
      }

      const clamped = Math.max(1, Math.min(50, Math.floor(roundsToWin)))

      room.roundsToWin = clamped
      bump(room)

      io.to(roomId).emit(SOCKET_EVENTS.ROOM_STATE, toRoomState(room))
      ack?.({ ok: true })
    } catch {
      ack?.({ ok: false, error: 'UNKNOWN' })
    }
  })

  socket.on('disconnect', () => {
    const roomId = socket.data.roomId as string | undefined
    const playerId = socket.data.playerId as string | undefined
    if (!roomId || !playerId) return

    const room = getRoom(roomId)

    if (!room) return

    const player = room.playersById[playerId]
    if (!player) return

    if (player.socketId !== socket.id) return

    player.connected = false
    player.disconnectedAt = Date.now()
    player.socketId = null

    player.purgeTimer = setTimeout(() => {
      const r = getRoom(roomId)
      if (!r) return

      const p = r.playersById[playerId]
      if (!p) return

      if (p.connected) return

      delete r.playersById[playerId]

      if (r.hostId === playerId) {
        const next = Object.keys(r.playersById)[0] ?? null
        r.hostId = next ?? ''
      }
      if (r.presiId === playerId) {
        const next = Object.keys(r.playersById)[0] ?? null
        r.presiId = next ?? ''
      }

      bump(r)
      io.to(roomId).emit(SOCKET_EVENTS.ROOM_STATE, toRoomState(r))
    }, PURGE_AFTER_MS)

    bump(room)
    io.to(roomId).emit(SOCKET_EVENTS.ROOM_STATE, toRoomState(room))
  })
}
