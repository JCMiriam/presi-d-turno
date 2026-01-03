import express from "express";
import http from "http";
import cors from "cors";
import { Server, type Socket } from "socket.io";
import {
  SOCKET_EVENTS,
  type ClientToServerEvents,
  type ServerToClientEvents,
  type RoomStatePayload
} from "@pdt/shared";

type InterServerEvents = Record<string, never>;
type SocketData = Record<string, never>;

const app = express();
app.use(cors());
app.get("/health", (_req, res) => res.json({ ok: true }));

const httpServer = http.createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
  cors: { origin: "*" }
});

type Player = { id: string; username: string; avatarId: string };
const rooms = new Map<string, { players: Player[] }>();

io.on("connection", (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
  socket.on(SOCKET_EVENTS.JOIN_ROOM, (payload) => {
    const { roomId, username, avatarId } = payload;

    socket.join(roomId);

    const room = rooms.get(roomId) ?? { players: [] };
    room.players.push({ id: socket.id, username, avatarId });
    rooms.set(roomId, room);

    const state: RoomStatePayload = { roomId, players: room.players };
    io.to(roomId).emit(SOCKET_EVENTS.ROOM_STATE, state);
  });
});

const PORT = Number(process.env.PORT ?? 10000);
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on :${PORT}`);
});
