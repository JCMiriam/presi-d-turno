import { SOCKET_EVENTS, type StartGamePayload } from '@pdt/shared'
import type { Server, Socket } from 'socket.io'
import type { ServerRoom } from '../types/room.js'
import { getRoom } from '../state/rooms.store.js'
import { startGameDealAnswers } from '../game/answers.deck.js'

function toRoomState(room: ServerRoom) {
  return {
    roomId: room.roomId,
    version: room.version,
    hostId: room.hostId,
    presiId: room.presiId,
    status: room.status,
    pointsToWin: room.pointsToWin,
    roundsToWin: room.roundsToWin,
    round: room.round,
    players: Object.values(room.playersById).map((p) => ({
      id: p.id,
      username: p.username,
      avatarId: p.avatarId,
      points: p.points,
    })),
  }
}

function bump(room: ServerRoom) {
  room.version += 1
}

export function registerStartGameHandler(io: Server, socket: Socket) {
  socket.on(SOCKET_EVENTS.START_GAME, (payload: StartGamePayload, ack) => {
    try {
      const roomId = payload.roomId?.trim().toUpperCase()
      if (!roomId) return ack?.({ ok: false, error: 'UNKNOWN' })

      const socketRoomId = socket.data.roomId as string | undefined
      const socketPlayerId = socket.data.playerId as string | undefined

      if (!socketRoomId || !socketPlayerId || socketRoomId !== roomId) {
        return ack?.({ ok: false, error: 'UNKNOWN' })
      }

      const room = getRoom(roomId)
      if (!room) return ack?.({ ok: false, error: 'ROOM_NOT_FOUND' })

      if (room.hostId !== socketPlayerId) {
        return ack?.({ ok: false, error: 'NOT_HOST' })
      }

      room.status = 'in_game'
      room.round = 1

      startGameDealAnswers(room)

      bump(room)

      io.to(roomId).emit(SOCKET_EVENTS.ROOM_STATE, toRoomState(room))

      for (const p of Object.values(room.playersById)) {
        if (!p.socketId) continue
        io.to(p.socketId).emit(SOCKET_EVENTS.HAND_STATE, {
          roomId,
          version: room.version,
          hand: room.handsByPlayerId[p.id] ?? [],
        })
      }

      ack?.({ ok: true })
    } catch {
      ack?.({ ok: false, error: 'UNKNOWN' })
    }
  })
}
