import type { ServerRoom } from '../types/room.js'
import { ensureRenderedQuestion } from './questions.deck.js'

type CardId = string

function drawOne(pile: CardId[]): { id: CardId; remaining: CardId[] } {
  if (pile.length < 1) throw new Error('No quedan preguntas.')
  return { id: pile[0]!, remaining: pile.slice(1) }
}

export function startNextRoundQuestion(room: ServerRoom): void {
  const { id, remaining } = drawOne(room.questionsDrawPile)
  room.questionsDrawPile = remaining
  room.questionsDiscard.push(id)

  const { text, required } = ensureRenderedQuestion(room, id)

  room.currentQuestionId = id
  room.currentQuestionText = text
  room.requiredAnswers = required

  room.version += 1
}
