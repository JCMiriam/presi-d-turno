export const SOCKET_EVENTS = {
  JOIN_ROOM: "join_room",
  ROOM_STATE: "room_state",
  ERROR: "error"
} as const;

export type JoinRoomPayload = {
  roomId: string;
  username: string;
  avatarId: number;
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

export type Player = {
  id: string;
  username: string;
  avatarId: number;
  points: number;
};

export type RoomState = {
  roomId: string;
  version: number;
  hostId: string;
  presiId: string;
  players: Player[];
  status: "lobby" | "in_game" | "finished";
  pointsToWin: number;
  round: number;
};

