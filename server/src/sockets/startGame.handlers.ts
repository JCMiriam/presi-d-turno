import { SOCKET_EVENTS, type StartGamePayload } from '@pdt/shared'
import type { Server, Socket } from 'socket.io'
import { getRoom, toRoomState } from '../state/rooms.store.js'

import { startGameDealAnswers, ensureRenderedAnswerText } from '../game/answers.deck.js'
import { initQuestionsForGame } from '../game/questions.deck.js'
import { startNextRoundQuestion } from '../game/questions.round.js'

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

      room.roundSubmissions = []

      startGameDealAnswers(room)

      initQuestionsForGame(room)
      startNextRoundQuestion(room)

      io.to(roomId).emit(SOCKET_EVENTS.ROOM_STATE, toRoomState(room))

      for (const p of Object.values(room.playersById)) {
        if (!p.socketId) continue

        io.to(p.socketId).emit(SOCKET_EVENTS.HAND_STATE, {
          roomId,
          version: room.version,
          hand: (room.handsByPlayerId[p.id] ?? []).map((id) => ({
            id,
            text: ensureRenderedAnswerText(room, id),
          })),
        })
      }

      ack?.({ ok: true })
    } catch {
      ack?.({ ok: false, error: 'UNKNOWN' })
    }
  })
}
