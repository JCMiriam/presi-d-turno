export const SOCKET_EVENTS = {
  JOIN_ROOM: "join_room",
  ROOM_STATE: "room_state",
  ERROR: "error"
} as const;

export type JoinRoomPayload = {
  roomId: string;
  username: string;
  avatarId: string;
};

export type RoomStatePayload = {
  roomId: string;
  players: Array<{ id: string; username: string; avatarId: string }>;
};

export interface ClientToServerEvents {
  [SOCKET_EVENTS.JOIN_ROOM]: (payload: JoinRoomPayload) => void;
}

export interface ServerToClientEvents {
  [SOCKET_EVENTS.ROOM_STATE]: (payload: RoomStatePayload) => void;
  [SOCKET_EVENTS.ERROR]: (message: string) => void;
}
