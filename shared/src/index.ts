import questions from './decks/questions.json'
import answers from './decks/answers.json'
import characters from './decks/characters.json'

export const SOCKET_EVENTS = {
  CREATE_ROOM: 'create_room',
  JOIN_ROOM: 'join_room',
  ROOM_STATE: 'room_state',
  UPDATE_ROOM_SETTINGS: 'update_room_settings',
  START_GAME: 'start_game',
  HAND_STATE: 'hand_state',
  PLAY_ANSWERS: 'play_answers',
  ERROR: 'error',
} as const

export type StartGamePayload = { roomId: string }
export type StartGameAck =
  | { ok: true }
  | { ok: false; error: 'ROOM_NOT_FOUND' | 'NOT_HOST' | 'UNKNOWN' }

export type HandStatePayload = {
  roomId: string
  version: number
  hand: string[]
}

export type PlayAnswersPayload = {
  roomId: string
  cardIds: string[]
}

export type PlayAnswersAck =
  | { ok: true }
  | { ok: false; error: 'ROOM_NOT_FOUND' | 'NOT_IN_ROOM' | 'INVALID_PLAY' | 'UNKNOWN' }

export type Decks = {
  questions: string[]
  answers: string[]
  characters: string[]
}

export const decks: Decks = {
  questions: questions as string[],
  answers: answers as string[],
  characters: characters as string[],
}

export type CreateRoomPayload = {
  username: string
  avatarId: number
}

export type JoinRoomPayload = {
  roomId: string
  playerId: string
  playerToken: string
  username: string
  avatarId: number
}

export type UpdateRoomSettingsPayload = {
  roomId: string
  roundsToWin: number
}

export type CreateRoomAck = { ok: true; roomId: string } | { ok: false; error: 'UNKNOWN' }

export type JoinRoomAck =
  | { ok: true; roomId: string }
  | { ok: false; error: 'ROOM_ID_INVALID' | 'ROOM_NOT_FOUND' | 'UNKNOWN' }

export type UpdateRoomSettingsAck =
  | { ok: true }
  | { ok: false; error: 'NOT_HOST' | 'ROOM_NOT_FOUND' | 'INVALID_SETTINGS' | 'UNKNOWN' }

export type Player = {
  id: string
  username: string
  avatarId: number
  points: number
}

export type RoomState = {
  roomId: string
  version: number
  hostId: string
  presiId: string
  players: Player[]
  status: 'lobby' | 'in_game' | 'finished'
  pointsToWin: number
  roundsToWin: number
  round: number
}

export interface ClientToServerEvents {
  [SOCKET_EVENTS.CREATE_ROOM]: (
    payload: CreateRoomPayload,
    ack?: (res: CreateRoomAck) => void,
  ) => void

  [SOCKET_EVENTS.JOIN_ROOM]: (payload: JoinRoomPayload, ack?: (res: JoinRoomAck) => void) => void

  [SOCKET_EVENTS.UPDATE_ROOM_SETTINGS]: (
    payload: UpdateRoomSettingsPayload,
    ack?: (res: UpdateRoomSettingsAck) => void,
  ) => void

  [SOCKET_EVENTS.START_GAME]: (payload: StartGamePayload, ack?: (res: StartGameAck) => void) => void
  [SOCKET_EVENTS.PLAY_ANSWERS]: (
    payload: PlayAnswersPayload,
    ack?: (res: PlayAnswersAck) => void,
  ) => void
}

export interface ServerToClientEvents {
  [SOCKET_EVENTS.ROOM_STATE]: (payload: RoomState) => void
  [SOCKET_EVENTS.ERROR]: (message: string) => void
  [SOCKET_EVENTS.HAND_STATE]: (payload: HandStatePayload) => void
}
