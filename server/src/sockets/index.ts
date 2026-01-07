import type { Server, Socket } from 'socket.io'
import type { ClientToServerEvents, ServerToClientEvents } from '@pdt/shared'
import { registerRoomHandlers } from './room.handlers.js'
import { registerCreateRoomHandler } from './createRoom.handlers.js'
import { registerStartGameHandler } from './startGame.handlers.js'
import { registerPlayAnswersHandler } from './playAnswers.handlers.js'

type InterServerEvents = Record<string, never>

type SocketData = {
  roomId?: string
  playerId?: string
}

export function registerSocketHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
) {
  io.on(
    'connection',
    (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
      registerCreateRoomHandler(io, socket)
      registerRoomHandlers(io, socket)
      registerStartGameHandler(io, socket)
      registerPlayAnswersHandler(io, socket)
    },
  )
}
