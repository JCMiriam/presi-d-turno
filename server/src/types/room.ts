export type Player = {
  id: string
  username: string
  avatarId: string
}

export type Room = {
  version: number
  hostId: string
  presiId: string
  players: Player[]
  status: 'lobby' | 'in_game' | 'finished'
  pointsToWin: number
  round: number
}

export type ServerPlayer = {
  id: string
  token: string
  username: string
  avatarId: number
  points: number
  socketId: string | null
  connected: boolean
  disconnectedAt: number | null
  purgeTimer?: NodeJS.Timeout
}

export type ServerRoom = {
  roomId: string
  version: number
  hostId: string
  presiId: string
  status: 'lobby' | 'in_game' | 'finished'
  pointsToWin: number
  roundsToWin: number
  round: number
  playersById: Record<string, ServerPlayer>
}
