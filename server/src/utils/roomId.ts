const ROOM_ID_LENGTH = 6
const ROOM_ID_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateRoomId(): string {
  let id = ''
  for (let i = 0; i < ROOM_ID_LENGTH; i++) {
    const index = Math.floor(Math.random() * ROOM_ID_CHARS.length)
    id += ROOM_ID_CHARS[index]
  }
  return id
}

export function isValidRoomId(value: unknown): value is string {
  if (typeof value !== 'string') return false
  return /^[A-Z2-9]{6}$/.test(value)
}
