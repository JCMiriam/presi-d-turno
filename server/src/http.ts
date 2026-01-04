import http from 'http'
import { Server } from 'socket.io'
import type { ClientToServerEvents, ServerToClientEvents } from '@pdt/shared'
import { registerSocketHandlers } from './sockets/index.js'

type InterServerEvents = Record<string, never>
type SocketData = Record<string, never>

export function createHttpServer(app: Express.Application) {
  const httpServer = http.createServer(app)

  const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
    httpServer,
    {
      cors: { origin: '*' },
    },
  )

  registerSocketHandlers(io)

  return httpServer
}
