import type { Server, Socket } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "@pdt/shared";
import { registerRoomHandlers } from "./room.handlers.js";

type InterServerEvents = Record<string, never>;
type SocketData = Record<string, never>;

export function registerSocketHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
) {
  io.on("connection", (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    registerRoomHandlers(io, socket);
  });
}
