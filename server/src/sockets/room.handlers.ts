import type { Server, Socket } from 'socket.io'
import {
  SOCKET_EVENTS,
  type ClientToServerEvents,
  type ServerToClientEvents,
  type RoomState,
} from '@pdt/shared'
import { addPlayerToRoom, createRoom, roomExists, getRoom } from '../state/rooms.store.js'
import { isValidRoomId } from '../utils/roomId.js'

type InterServerEvents = Record<string, never>
type SocketData = Record<string, never>

function buildRoomState(roomId: string): RoomState {
  const room = getRoom(roomId)
  if (!room) {
    // Esto no debería ocurrir si controlas roomExists/getRoom bien,
    // pero preferimos fallar fuerte y claro.
    throw new Error(`Room not found: ${roomId}`)
  }

  return {
    roomId,
    version: room.version,
    hostId: room.hostId,
    presiId: room.presiId,
    players: room.players,
    status: room.status,
    pointsToWin: room.pointsToWin,
    round: room.round,
  }
}

export function registerRoomHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
) {
  socket.on(SOCKET_EVENTS.CREATE_ROOM, (payload, ack) => {
    const { username, avatarId } = payload

    const { roomId } = createRoom()

    socket.join(roomId)

    // ✅ avatarId es number (si shared está bien)
    addPlayerToRoom(roomId, { id: socket.id, username, avatarId })

    const state = buildRoomState(roomId)
    io.to(roomId).emit(SOCKET_EVENTS.ROOM_STATE, state)

    ack?.({ ok: true, roomId })
  })

  socket.on(SOCKET_EVENTS.JOIN_ROOM, (payload, ack) => {
    const { roomId: rawRoomId, username, avatarId } = payload

    const roomId = rawRoomId?.trim?.().toUpperCase?.() ?? rawRoomId

    if (!isValidRoomId(roomId)) {
      ack?.({ ok: false, error: 'ROOM_ID_INVALID' })
      return
    }

    if (!roomExists(roomId)) {
      ack?.({ ok: false, error: 'ROOM_NOT_FOUND' })
      return
    }

    socket.join(roomId)

    addPlayerToRoom(roomId, { id: socket.id, username, avatarId })

    const state = buildRoomState(roomId)
    io.to(roomId).emit(SOCKET_EVENTS.ROOM_STATE, state)

    ack?.({ ok: true, roomId })
  })
}
