import { SOCKET_EVENTS, type PlayAnswersPayload } from '@pdt/shared'
import type { Server, Socket } from 'socket.io'
import { getRoom, toRoomState } from '../state/rooms.store.js'
import { spendAnswers } from '../game/answers.play.js'
import { randomUUID } from 'crypto'
import { ensureRenderedAnswerText } from '@app/game/answers.deck.js'

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

      room.roundSubmissions = room.roundSubmissions ?? []
      const alreadyPlayed = room.roundSubmissions.some((s) => s.playerId === socketPlayerId)
      if (alreadyPlayed) {
        return ack?.({ ok: false, error: 'INVALID_PLAY' })
      }

      spendAnswers(room, socketPlayerId, cardIds)

      const texts = cardIds.map((id) => room.answerTextById[id])
      if (texts.some((t) => typeof t !== 'string')) {
        return ack?.({ ok: false, error: 'INVALID_PLAY' })
      }

      const text = texts.join('\n')

      room.roundSubmissions.push({
        id: randomUUID(),
        playerId: socketPlayerId,
        cardIds,
        text,
      })

      room.version += 1

      const player = room.playersById[socketPlayerId]
      if (player?.socketId) {
        io.to(player.socketId).emit(SOCKET_EVENTS.HAND_STATE, {
          roomId,
          version: room.version,
          hand: (room.handsByPlayerId[socketPlayerId] ?? []).map((id) => ({
            id,
            text: ensureRenderedAnswerText(room, id),
          })),
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
