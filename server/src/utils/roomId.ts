const ROOM_ID_LENGTH = 6
const ROOM_ID_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateRoomId(len = 6): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let id = ''
  for (let i = 0; i < len; i++) id += alphabet[Math.floor(Math.random() * alphabet.length)]
  return id
}

export function isValidRoomId(value: unknown): value is string {
  if (typeof value !== 'string') return false
  return /^[A-Z2-9]{6}$/.test(value)
}
