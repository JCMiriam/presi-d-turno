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
