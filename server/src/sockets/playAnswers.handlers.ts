import { SOCKET_EVENTS, type PlayAnswersPayload } from '@pdt/shared'
import type { Server, Socket } from 'socket.io'
import { getRoom } from '../state/rooms.store.js'
import { spendAnswers } from '../game/answers.play.js'
import type { ServerRoom } from '../types/room.js'

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

export function registerPlayAnswersHandler(io: Server, socket: Socket) {
  socket.on(SOCKET_EVENTS.PLAY_ANSWERS, (payload: PlayAnswersPayload, ack) => {
    try {
      const roomId = payload.roomId?.trim().toUpperCase()
      const cardIds = payload.cardIds

      if (!roomId || !Array.isArray(cardIds)) {
        return ack?.({ ok: false, error: 'UNKNOWN' })
      }

      const socketRoomId = socket.data.roomId as string | undefined
      const socketPlayerId = socket.data.playerId as string | undefined

      if (!socketRoomId || !socketPlayerId || socketRoomId !== roomId) {
        return ack?.({ ok: false, error: 'NOT_IN_ROOM' })
      }

      const room = getRoom(roomId)
      if (!room) return ack?.({ ok: false, error: 'ROOM_NOT_FOUND' })

      spendAnswers(room, socketPlayerId, cardIds)

      const player = room.playersById[socketPlayerId]
      if (player?.socketId) {
        io.to(player.socketId).emit(SOCKET_EVENTS.HAND_STATE, {
          roomId,
          version: room.version,
          hand: room.handsByPlayerId[socketPlayerId] ?? [],
        })
      }

      io.to(roomId).emit(SOCKET_EVENTS.ROOM_STATE, toRoomState(room))

      ack?.({ ok: true })
    } catch (e: any) {
      const msg = String(e?.message ?? '')

      if (msg.includes('Debes jugar entre 1 y 3')) {
        return ack?.({ ok: false, error: 'INVALID_PLAY' })
      }
      if (msg.includes('no está en la mano')) {
        return ack?.({ ok: false, error: 'INVALID_PLAY' })
      }
      if (msg.includes('No hay suficientes answers')) {
        return ack?.({ ok: false, error: 'UNKNOWN' })
      }

      ack?.({ ok: false, error: 'UNKNOWN' })
    }
  })
}
