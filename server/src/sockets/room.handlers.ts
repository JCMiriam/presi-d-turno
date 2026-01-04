import type { Server, Socket } from "socket.io";
import { SOCKET_EVENTS, type ClientToServerEvents, type ServerToClientEvents, type RoomStatePayload } from "@pdt/shared";
import { addPlayerToRoom } from "../state/rooms.store.js";

type InterServerEvents = Record<string, never>;
type SocketData = Record<string, never>;

export function registerRoomHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
  socket: Socket<ClientToServerEvents, ServerToClientEvents>
) {
  socket.on(SOCKET_EVENTS.JOIN_ROOM, (payload) => {
    const { roomId, username, avatarId } = payload;

    socket.join(roomId);

    const room = addPlayerToRoom(roomId, { id: socket.id, username, avatarId });

    const state: RoomStatePayload = { roomId, players: room.players };
    io.to(roomId).emit(SOCKET_EVENTS.ROOM_STATE, state);
  });
}
