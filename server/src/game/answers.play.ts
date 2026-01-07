import type { ServerRoom } from '../types/room.js'

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
    if (!handSet.has(id))
      throw new Error(`La carta ${id} no está en la mano del jugador ${playerId}.`)
  }

  const spent = new Set(cardIds)
  room.handsByPlayerId[playerId] = hand.filter((id) => !spent.has(id))

  // “gastadas”
  room.answersDiscard.push(...cardIds)

  // Reponer INMEDIATAMENTE (simplifica y equivale a “final de ronda” en práctica)
  // Si prefieres estrictamente al final de ronda, lo cambio a pendingRefill.
  const { drawn, remaining } = draw(room.answersDrawPile, cardIds.length)
  room.answersDrawPile = remaining
  room.handsByPlayerId[playerId].push(...drawn)

  room.version += 1
}
