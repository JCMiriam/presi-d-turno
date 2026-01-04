export const SOCKET_EVENTS = {
  CREATE_ROOM: 'create_room',
  JOIN_ROOM: 'join_room',
  ROOM_STATE: 'room_state',
  ERROR: 'error',
} as const

/* =======================
   Payloads
======================= */

export type CreateRoomPayload = {
  username: string
  avatarId: number
}

export type JoinRoomPayload = {
  roomId: string
  username: string
  avatarId: number
}

/* =======================
   ACKs
======================= */

export type CreateRoomAck = { ok: true; roomId: string } | { ok: false; error: 'UNKNOWN' }

export type JoinRoomAck =
  | { ok: true; roomId: string }
  | { ok: false; error: 'ROOM_ID_INVALID' | 'ROOM_NOT_FOUND' | 'UNKNOWN' }

/* =======================
   Domain types
======================= */

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
  round: number
}

/**
 * (Opcional) Payload ligero si algún día quieres un evento separado para lobby.
 * Ahora mismo NO lo usamos en ROOM_STATE.
 */
export type RoomStatePayload = {
  roomId: string
  players: Array<{ id: string; username: string; avatarId: number }>
}

/* =======================
   Socket event maps
======================= */

export interface ClientToServerEvents {
  [SOCKET_EVENTS.CREATE_ROOM]: (
    payload: CreateRoomPayload,
    ack?: (res: CreateRoomAck) => void,
  ) => void
  [SOCKET_EVENTS.JOIN_ROOM]: (payload: JoinRoomPayload, ack?: (res: JoinRoomAck) => void) => void
}

export interface ServerToClientEvents {
  // ✅ ROOM_STATE envía el snapshot completo
  [SOCKET_EVENTS.ROOM_STATE]: (payload: RoomState) => void
  [SOCKET_EVENTS.ERROR]: (message: string) => void
}
