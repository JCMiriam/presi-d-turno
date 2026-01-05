export const SOCKET_EVENTS = {
  CREATE_ROOM: 'create_room',
  JOIN_ROOM: 'join_room',
  ROOM_STATE: 'room_state',
  UPDATE_ROOM_SETTINGS: 'update_room_settings',
  ERROR: 'error',
} as const

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

export type RoomStatePayload = {
  roomId: string
  players: Array<{ id: string; username: string; avatarId: number }>
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
}

export interface ServerToClientEvents {
  [SOCKET_EVENTS.ROOM_STATE]: (payload: RoomState) => void
  [SOCKET_EVENTS.ERROR]: (message: string) => void
}
