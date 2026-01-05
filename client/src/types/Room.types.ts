import type { Player, RoomState } from '@pdt/shared'

export interface RoomStoreState {
  roomId: string | null
  version: number
  status: RoomState['status']
  hostId: string | null
  presiId: string | null
  pointsToWin: number
  round: number

  myId: string | null
  playersById: Record<string, Player>
  playerIds: string[]
}

export interface RoomStoreGetters {
  players: Player[]
  me: Player | null
}

export interface RoomStoreActions {
  setMyId(id: string): void
  applySnapshot(snapshot: RoomState): void
  reset(): void
}

export type RoomStore = RoomStoreState &
  RoomStoreGetters &
  RoomStoreActions
