import type { ServerRoom } from '../types/room.js'
import { ensureRenderedAnswerText } from './answers.deck.js' // <-- NUEVO

type CardId = string

function draw(pile: CardId[], n: number): { drawn: CardId[]; remaining: CardId[] } {
  if (pile.length < n) throw new Error(`No hay suficientes answers para reponer (${n}).`)
  return { drawn: pile.slice(0, n), remaining: pile.slice(n) }
}

export function spendAnswers(room: ServerRoom, playerId: string, cardIds: CardId[]): void {
  if (cardIds.length < 1 || cardIds.length > 3) {
    throw new Error('Debes jugar entre 1 y 3 cartas.')
  }

  const hand = room.handsByPlayerId[playerId] ?? []
  const handSet = new Set(hand)

  for (const id of cardIds) {
    if (!handSet.has(id)) {
      throw new Error(`La carta ${id} no está en la mano del jugador ${playerId}.`)
    }
  }

  const spent = new Set(cardIds)
  room.handsByPlayerId[playerId] = hand.filter((id) => !spent.has(id))

  room.answersDiscard.push(...cardIds)

  const { drawn, remaining } = draw(room.answersDrawPile, cardIds.length)
  room.answersDrawPile = remaining
  room.handsByPlayerId[playerId].push(...drawn)

  for (const id of drawn) {
    ensureRenderedAnswerText(room, id)
  }

  room.version += 1
}
