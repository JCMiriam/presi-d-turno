import { decks } from '@pdt/shared'
import { renderAnswerText } from './answers.render.js'

import type { ServerRoom } from '../types/room.js'

type CardId = string

const HAND_SIZE_ON_START = 10

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
    throw new Error(`No hay suficientes answers. Necesitas ${n}, quedan ${pile.length}.`)
  }
  return { drawn: pile.slice(0, n), remaining: pile.slice(n) }
}

function buildAllAnswerIds(): CardId[] {
  return decks.answers.map((_: string, i: number) => `a-${i}`)
}

function baseAnswerTextFromId(id: CardId): string {
  // ids: "a-0", "a-1", ...
  const n = Number(id.replace('a-', ''))
  if (!Number.isFinite(n)) return id
  return decks.answers[n] ?? id
}

export function ensureRenderedAnswerText(room: ServerRoom, id: CardId): string {
  const cached = room.answerTextById?.[id]
  if (cached) return cached

  const base = baseAnswerTextFromId(id)
  const rendered = renderAnswerText(room, base)

  room.answerTextById ||= {}
  room.answerTextById[id] = rendered

  return rendered
}

export function startGameDealAnswers(room: ServerRoom): void {
  const playerIds = Object.keys(room.playersById)
  const needed = playerIds.length * HAND_SIZE_ON_START
  const all = buildAllAnswerIds()

  if (all.length < needed) {
    throw new Error(`No hay suficientes cartas para repartir. Necesitas ${needed} y solo hay ${all.length}.`)
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
