import { SOCKET_EVENTS, type PickWinnerPayload } from '@pdt/shared'
import type { Server, Socket } from 'socket.io'
import { getRoom, toRoomState } from '../state/rooms.store.js'
import { startNextRoundQuestion } from '../game/questions.round.js'

function rotatePresi(room: { presiId: string; playersById: Record<string, any> }) {
  const ids = Object.keys(room.playersById)
  if (ids.length === 0) return

  const currentIdx = ids.indexOf(room.presiId)
  const nextIdx = currentIdx >= 0 ? (currentIdx + 1) % ids.length : 0
  room.presiId = ids[nextIdx]!
}

export function registerPickWinnerHandler(io: Server, socket: Socket) {
  socket.on(SOCKET_EVENTS.PICK_WINNER, (payload: PickWinnerPayload, ack) => {
    try {
      const roomId = payload.roomId?.trim().toUpperCase()
      const submissionId = payload.submissionId

      if (!roomId || !submissionId) {
        return ack?.({ ok: false, error: 'UNKNOWN' })
      }

      const socketRoomId = socket.data.roomId as string | undefined
      const socketPlayerId = socket.data.playerId as string | undefined

      if (!socketRoomId || !socketPlayerId || socketRoomId !== roomId) {
        return ack?.({ ok: false, error: 'NOT_IN_ROOM' })
      }

      const room = getRoom(roomId)
      if (!room) return ack?.({ ok: false, error: 'ROOM_NOT_FOUND' })

      if (room.presiId !== socketPlayerId) {
        return ack?.({ ok: false, error: 'NOT_PRESI' })
      }

      const submissions = room.roundSubmissions ?? []
      const picked = submissions.find((s) => s.id === submissionId)
      if (!picked) {
        return ack?.({ ok: false, error: 'INVALID_PICK' })
      }

      const winner = room.playersById[picked.playerId]
      if (!winner) {
        return ack?.({ ok: false, error: 'INVALID_PICK' })
      }
      winner.points += 1

      room.roundSubmissions = []

      if (winner.points >= room.pointsToWin || room.round >= room.roundsToWin) {
        room.status = 'finished'
        room.version += 1
        io.to(roomId).emit(SOCKET_EVENTS.ROOM_STATE, toRoomState(room))
        return ack?.({ ok: true })
      }

      room.round += 1
      rotatePresi(room)
      startNextRoundQuestion(room)

      io.to(roomId).emit(SOCKET_EVENTS.ROOM_STATE, toRoomState(room))
      return ack?.({ ok: true })
    } catch {
      return ack?.({ ok: false, error: 'UNKNOWN' })
    }
  })
}
