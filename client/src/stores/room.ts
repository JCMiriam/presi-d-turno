import { defineStore } from 'pinia'
import type { RoomState, Player } from '@pdt/shared'

type PlayersById = Record<string, Player>

function normalizePlayers(players: Player[]): { byId: PlayersById; ids: string[] } {
  const byId: PlayersById = {}
  const ids: string[] = []
  const seen = new Set<string>()

  for (const p of players) {
    byId[p.id] = p

    if (!seen.has(p.id)) {
      seen.add(p.id)
      ids.push(p.id)
    }
  }

  return { byId, ids }
}

function isPlayer(p: Player | undefined): p is Player {
  return Boolean(p)
}

export const useRoomStore = defineStore('room', {
  state: () => ({
    roomId: null as string | null,
    version: 0,
    status: 'lobby' as RoomState['status'],
    hostId: null as string | null,
    presiId: null as string | null,

    pointsToWin: 0,
    roundsToWin: 5,
    round: 0,

    myPlayerId: null as string | null,
    mySocketId: null as string | null,

    playersById: {} as PlayersById,
    playerIds: [] as string[],
  }),

  getters: {
    players(state): Player[] {
      return state.playerIds.map((id) => state.playersById[id]).filter(isPlayer)
    },

    me(state): Player | undefined {
      if (state.myPlayerId && state.playersById[state.myPlayerId]) {
        return state.playersById[state.myPlayerId]
      }
      if (state.mySocketId && state.playersById[state.mySocketId]) {
        return state.playersById[state.mySocketId]
      }
      return undefined
    },

    myEffectiveId(state): string | null {
      return state.myPlayerId ?? state.mySocketId
    },
  },

  actions: {
    setMyPlayerId(id: string) {
      this.myPlayerId = id
    },

    setMySocketId(id: string) {
      this.mySocketId = id
    },

    setRoundsToWin(value: number) {
      this.roundsToWin = value
    },

    applySnapshot(snapshot: RoomState) {
      if (snapshot.version < this.version) return

      this.roomId = snapshot.roomId
      this.version = snapshot.version
      this.status = snapshot.status
      this.hostId = snapshot.hostId
      this.presiId = snapshot.presiId

      this.pointsToWin = snapshot.pointsToWin
      this.round = snapshot.round

      this.roundsToWin =
        typeof (snapshot as any).roundsToWin === 'number'
          ? (snapshot as any).roundsToWin
          : this.roundsToWin

      const normalized = normalizePlayers(snapshot.players)
      this.playersById = normalized.byId
      this.playerIds = normalized.ids
    },

    reset() {
      this.roomId = null
      this.version = 0
      this.status = 'lobby'
      this.hostId = null
      this.presiId = null

      this.pointsToWin = 0
      this.roundsToWin = 5
      this.round = 0

      this.myPlayerId = null
      this.mySocketId = null

      this.playersById = {}
      this.playerIds = []
    },
  },
})
