import { Room, Player } from "../types/room.js";

const rooms = new Map<string, Room>();

export function getOrCreateRoom(roomId: string): Room {
  const room = rooms.get(roomId) ?? { players: [] };
  rooms.set(roomId, room);
  return room;
}

export function addPlayerToRoom(roomId: string, player: Player): Room {
  const room = getOrCreateRoom(roomId);

  if (!room.players.some((p) => p.id === player.id)) {
    room.players.push(player);
  }

  return room;
}
