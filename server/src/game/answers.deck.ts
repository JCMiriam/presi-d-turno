import { decks } from '@pdt/shared'

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
  if (pile.length < n)
    throw new Error(`No hay suficientes answers. Necesitas ${n}, quedan ${pile.length}.`)
  return { drawn: pile.slice(0, n), remaining: pile.slice(n) }
}

function buildAllAnswerIds(): CardId[] {
  return decks.answers.map((_: string, i: number) => `a-${i}`)
}

export function startGameDealAnswers(room: ServerRoom): void {
  const playerIds = Object.keys(room.playersById)
  const needed = playerIds.length * HAND_SIZE_ON_START
  const all = buildAllAnswerIds()

  if (all.length < needed) {
    throw new Error(
      `No hay suficientes cartas para repartir. Necesitas ${needed} y solo hay ${all.length}.`,
    )
  }

  let drawPile = shuffle(all)

  room.answersDiscard = []
  room.handsByPlayerId = {}

  for (const playerId of playerIds) {
    const { drawn, remaining } = draw(drawPile, HAND_SIZE_ON_START)
    drawPile = remaining
    room.handsByPlayerId[playerId] = drawn
  }

  room.answersDrawPile = drawPile
  room.version += 1
}
