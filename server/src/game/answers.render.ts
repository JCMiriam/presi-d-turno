import { loadDecks } from '@pdt/shared/decks'
import type { ServerRoom } from '../types/room.js'

const CHARACTER_TOKEN = /{{\s*CHARACTER\s*}}/g

const decks = await loadDecks()

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

function chooseCharacter(room: ServerRoom): string {
  const playerNames = Object.values(room.playersById)
    .map((p) => p.username?.trim())
    .filter(Boolean) as string[]

  const fromPlayers = playerNames.length > 0 && Math.random() < 0.5
  if (fromPlayers) return pickRandom(playerNames)

  const chars = decks.characters ?? []
  if (chars.length > 0) return pickRandom(chars)

  return 'Alguien'
}

export function renderAnswerText(room: ServerRoom, baseText: string): string {
  if (!CHARACTER_TOKEN.test(baseText)) return baseText

  CHARACTER_TOKEN.lastIndex = 0

  const chosen = chooseCharacter(room)

  return baseText.replace(CHARACTER_TOKEN, chosen)
}
