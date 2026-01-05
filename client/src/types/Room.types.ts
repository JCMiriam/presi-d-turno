import type { Player, RoomState } from '@pdt/shared'

export interface RoomStoreState {
  roomId: string | null
  version: number
  status: RoomState['status']
  hostId: string | null
  presiId: string | null

  pointsToWin: number
  roundsToWin: number
  round: number

  myPlayerId: string | null
  mySocketId: string | null

  playersById: Record<string, Player>
  playerIds: string[]
}

export interface RoomStoreGetters {
  players: Player[]
  me: Player | undefined
  myEffectiveId: string | null
}

export interface RoomStoreActions {
  setMyPlayerId(id: string): void
  setMySocketId(id: string): void
  applySnapshot(snapshot: RoomState): void
  reset(): void
}

export type RoomStore = RoomStoreState & RoomStoreGetters & RoomStoreActions
