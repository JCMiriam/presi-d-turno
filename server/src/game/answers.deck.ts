import { loadDecks } from '@pdt/shared/decks'
import { renderAnswerText } from './answers.render.js'

import type { ServerRoom } from '../types/room.js'

type CardId = string

const HAND_SIZE_ON_START = 10

const decks = await loadDecks()

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function draw(pile: CardId[], n: number): { drawn: CardId[]; remaining: CardId[] } {
  if (pile.length < n) {
    throw new Error(`No hay suficientes cartas. Necesitas ${n}, quedan ${pile.length}.`)
  }
  return { drawn: pile.slice(0, n), remaining: pile.slice(n) }
}

function buildAllCardIds(room: ServerRoom): CardId[] {
  const answerIds = decks.answers.map((_: string, i: number) => `a-${i}`)
  const characterIds = decks.characters.map((_: string, i: number) => `c-${i}`)

  const playerCardIds = Object.keys(room.playersById).map((playerId) => `p-${playerId}`)

  return [...answerIds, ...characterIds, ...playerCardIds]
}

function baseTextFromCardId(room: ServerRoom, id: CardId): string {
  if (id.startsWith('a-')) {
    const n = Number(id.slice(2))
    if (!Number.isFinite(n)) return id
    return decks.answers[n] ?? id
  }

  if (id.startsWith('c-')) {
    const n = Number(id.slice(2))
    if (!Number.isFinite(n)) return id
    return decks.characters[n] ?? id
  }

  if (id.startsWith('p-')) {
    const playerId = id.slice(2)
    const p = room.playersById[playerId]
    return p?.username ?? 'Jugador'
  }

  return id
}

export function ensureRenderedAnswerText(room: ServerRoom, id: CardId): string {
  const cached = room.answerTextById?.[id]
  if (cached) return cached

  const base = baseTextFromCardId(room, id)
  const rendered = renderAnswerText(room, base)

  room.answerTextById ||= {}
  room.answerTextById[id] = rendered
  return rendered
}

export function startGameDealAnswers(room: ServerRoom): void {
  const playerIds = Object.keys(room.playersById)
  const needed = playerIds.length * HAND_SIZE_ON_START

  const all = buildAllCardIds(room)

  if (all.length < needed) {
    throw new Error(
      `No hay suficientes cartas para repartir. Necesitas ${needed} y solo hay ${all.length}.`,
    )
  }

  let drawPile = shuffle(all)

  room.answersDiscard = []
  room.handsByPlayerId = {}
  room.answerTextById = {}

  for (const playerId of playerIds) {
    const { drawn, remaining } = draw(drawPile, HAND_SIZE_ON_START)
    drawPile = remaining
    room.handsByPlayerId[playerId] = drawn

    for (const id of drawn) {
      ensureRenderedAnswerText(room, id)
    }
  }

  room.answersDrawPile = drawPile
  room.version += 1
}
