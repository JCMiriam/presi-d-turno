import type { Player, RoomState } from '@pdt/shared'
import { generateRoomId } from '../utils/roomId.js'

const rooms = new Map<string, RoomState>()

export function roomExists(roomId: string): boolean {
  return rooms.has(roomId)
}

export function getRoom(roomId: string): RoomState | null {
  return rooms.get(roomId) ?? null
}

export function createRoom(params?: { pointsToWin?: number }): { roomId: string; room: RoomState } {
  let roomId: string

  do {
    roomId = generateRoomId()
  } while (rooms.has(roomId))

  const room: RoomState = {
    roomId,
    version: 1,
    hostId: '',
    presiId: '',
    players: [],
    status: 'lobby',
    pointsToWin: params?.pointsToWin ?? 5,
    round: 0,
  }

  rooms.set(roomId, room)

  return { roomId, room }
}

export function addPlayerToRoom(roomId: string, player: Omit<Player, 'points'>): RoomState {
  const room = rooms.get(roomId)
  if (!room) throw new Error('Room does not exist')

  const isFirstPlayer = room.players.length === 0

  if (!room.players.some((p) => p.id === player.id)) {
    room.players.push({ ...player, points: 0 })
    room.version += 1
  }

  if (isFirstPlayer) {
    room.hostId = player.id
    room.presiId = player.id
  }

  rooms.set(roomId, room)
  return room
}

export function removePlayerFromRoom(roomId: string, socketId: string): RoomState | null {
  const room = rooms.get(roomId)
  if (!room) return null

  const before = room.players.length
  room.players = room.players.filter((p) => p.id !== socketId)

  if (room.players.length !== before) {
    room.version += 1
  }

  if (room.players.length === 0) {
    rooms.delete(roomId)
    return null
  }

  if (room.hostId === socketId) {
    room.hostId = room.players[0]!.id
  }

  if (room.presiId === socketId) {
    room.presiId = room.players[0]!.id
  }

  rooms.set(roomId, room)
  return room
}
