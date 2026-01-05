import { reactive } from 'vue'
import { loadStoredUser, saveStoredUser, clearStoredUser, touchStoredUser } from './persistedUser'

export type UserProfile = {
  playerId: string
  playerToken: string
  username: string
  avatarId: number
}

export const userState = reactive<{
  user: UserProfile | null
}>({
  user: null,
})

export function setUser(user: UserProfile) {
  userState.user = user

  saveStoredUser({
    v: 1,
    playerId: user.playerId,
    playerToken: user.playerToken,
    username: user.username,
    avatarId: user.avatarId,
    lastRoomId: null,
    lastSeenAt: Date.now(),
  })
}

export function hydrateUserFromStorage(): boolean {
  if (userState.user) return true

  const stored = loadStoredUser()
  if (!stored) return false

  userState.user = {
    playerId: stored.playerId,
    playerToken: stored.playerToken,
    username: stored.username,
    avatarId: stored.avatarId,
  }

  touchStoredUser()

  return true
}

export function touchUserSession(patch?: { lastRoomId?: string | null }) {
  touchStoredUser({
    ...(patch?.lastRoomId !== undefined ? { lastRoomId: patch.lastRoomId } : {}),
  })
}

export function clearUser() {
  userState.user = null
  clearStoredUser()
}

export function hasUser(): boolean {
  return userState.user !== null
}

export function requireUser(): UserProfile {
  if (!userState.user) {
    throw new Error('User not initialized')
  }
  return userState.user
}
