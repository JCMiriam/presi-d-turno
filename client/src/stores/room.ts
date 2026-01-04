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
    round: 0,

    myId: null as string | null,
    playersById: {} as PlayersById,
    playerIds: [] as string[],
  }),

  getters: {
    players(state): Player[] {
      return state.playerIds.map((id) => state.playersById[id]).filter(isPlayer)
    },
    me(state): Player | null {
      if (!state.myId) return null
      return state.playersById[state.myId] ?? null
    },
  },

  actions: {
    setMyId(id: string) {
      this.myId = id
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
      this.round = 0
      this.myId = null
      this.playersById = {}
      this.playerIds = []
    },
  },
})
