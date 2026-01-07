import type { RoomState, Player } from '@pdt/shared'
import type { ServerRoom, ServerPlayer } from '../types/room.js'
import { generateRoomId } from '../utils/roomId.js'

const rooms = new Map<string, ServerRoom>()

export function roomExists(roomId: string): boolean {
  return rooms.has(roomId)
}

export function getRoom(roomId: string): ServerRoom | null {
  return rooms.get(roomId) ?? null
}

export function setRoom(room: ServerRoom) {
  rooms.set(room.roomId, room)
}

export function deleteRoom(roomId: string) {
  rooms.delete(roomId)
}

export function createRoom(params?: { pointsToWin?: number; roundsToWin?: number }): {
  roomId: string
  room: ServerRoom
} {
  let roomId: string

  do {
    roomId = generateRoomId()
  } while (rooms.has(roomId))

  const room: ServerRoom = {
    roomId,
    version: 1,
    hostId: '',
    presiId: '',
    status: 'lobby',
    roundsToWin: params?.roundsToWin ?? 10,
    pointsToWin: params?.pointsToWin ?? 5,
    round: 0,
    playersById: {},
    answersDrawPile: [],
    answersDiscard: [],
    answerTextById: {},
    handsByPlayerId: {},
    questionsDrawPile: [],
    questionsDiscard: [],
    questionTextById: {},
    currentQuestionId: null,
    currentQuestionText: null,
    requiredAnswers: 1,
  }

  rooms.set(roomId, room)
  return { roomId, room }
}

export function toRoomState(room: ServerRoom): RoomState {
  return {
    roomId: room.roomId,
    version: room.version,
    hostId: room.hostId,
    presiId: room.presiId,
    status: room.status,
    pointsToWin: room.pointsToWin,
    roundsToWin: room.roundsToWin,
    round: room.round,
    players: Object.values(room.playersById).map((p) => ({
      id: p.id,
      username: p.username,
      avatarId: p.avatarId,
      points: p.points,
    })),
    currentQuestionId: room.currentQuestionId,
    currentQuestionText: room.currentQuestionText,
    requiredAnswers: room.requiredAnswers,
  }
}

export function upsertPlayer(room: ServerRoom, player: ServerPlayer) {
  room.playersById[player.id] = player
  room.version += 1
  rooms.set(room.roomId, room)
}

export function removePlayer(roomId: string, playerId: string): ServerRoom | null {
  const room = rooms.get(roomId)
  if (!room) return null

  delete room.playersById[playerId]
  room.version += 1

  const remaining = Object.keys(room.playersById)

  if (remaining.length === 0) {
    rooms.delete(roomId)
    return null
  }

  if (room.hostId === playerId) room.hostId = remaining[0]!
  if (room.presiId === playerId) room.presiId = remaining[0]!

  rooms.set(roomId, room)
  return room
}
