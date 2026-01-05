export type StoredUserV1 = {
  v: 1
  playerId: string
  playerToken: string
  username: string
  avatarId: number
  lastRoomId: string | null
  lastSeenAt: number
}

const KEY = 'pdt:user'
const TTL_MS = 7 * 24 * 60 * 60 * 1000

function isNonEmptyString(x: unknown): x is string {
  return typeof x === 'string' && x.trim().length > 0
}

export function loadStoredUser(): StoredUserV1 | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<StoredUserV1>

    if (!parsed || parsed.v !== 1) {
      localStorage.removeItem(KEY)
      return null
    }

    if (typeof parsed.lastSeenAt !== 'number') {
      localStorage.removeItem(KEY)
      return null
    }

    const age = Date.now() - parsed.lastSeenAt
    if (age > TTL_MS) {
      localStorage.removeItem(KEY)
      return null
    }

    const needsMigration = !isNonEmptyString(parsed.playerId) || !isNonEmptyString(parsed.playerToken)

    const migrated: StoredUserV1 = {
      v: 1,
      playerId: needsMigration ? crypto.randomUUID() : parsed.playerId!,
      playerToken: needsMigration ? crypto.randomUUID() : parsed.playerToken!,
      username: isNonEmptyString(parsed.username) ? parsed.username : '',
      avatarId: typeof parsed.avatarId === 'number' ? parsed.avatarId : 0,
      lastRoomId: typeof parsed.lastRoomId === 'string' ? parsed.lastRoomId : null,
      lastSeenAt: parsed.lastSeenAt,
    }

    if (needsMigration) {
      localStorage.setItem(KEY, JSON.stringify({ ...migrated, lastSeenAt: Date.now() }))
    }

    if (!migrated.username) return null

    return migrated
  } catch {
    return null
  }
}

export function saveStoredUser(next: StoredUserV1) {
  localStorage.setItem(KEY, JSON.stringify(next))
}

export function touchStoredUser(patch?: Partial<StoredUserV1>) {
  const curr = loadStoredUser()
  if (!curr) return

  saveStoredUser({
    ...curr,
    ...patch,
    lastSeenAt: Date.now(),
  })
}

export function clearStoredUser() {
  localStorage.removeItem(KEY)
}
