import { loadDecks } from '@pdt/shared/decks'
import { renderAnswerText } from './answers.render.js'
import type { ServerRoom } from '../types/room.js'

type CardId = string
const decks = await loadDecks()

const CARD_TOKEN = /{{\s*CARD\s*}}/g
const BLANK = '_________'

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
    throw new Error(`No hay suficientes preguntas. Necesitas ${n}, quedan ${pile.length}.`)
  return { drawn: pile.slice(0, n), remaining: pile.slice(n) }
}

function buildAllQuestionIds(): CardId[] {
  return decks.questions.map((_: string, i: number) => `q-${i}`)
}

function baseQuestionTextFromId(id: CardId): string {
  const n = Number(id.slice(2))
  if (!Number.isFinite(n)) return id
  return decks.questions[n] ?? id
}

export function getRequiredAnswersFromQuestion(baseText: string): 1 | 2 | 3 {
  const matches = baseText.match(CARD_TOKEN)
  const count = matches?.length ?? 0
  if (count <= 1) return 1
  if (count === 2) return 2
  return 3
}

export function ensureRenderedQuestion(
  room: ServerRoom,
  id: CardId,
): { text: string; required: 1 | 2 | 3 } {
  const cached = room.questionTextById?.[id]
  if (cached) {
    const base = baseQuestionTextFromId(id)
    return { text: cached, required: getRequiredAnswersFromQuestion(base) }
  }

  const base = baseQuestionTextFromId(id)
  const required = getRequiredAnswersFromQuestion(base)

  const withCharacter = renderAnswerText(room, base)

  const text = withCharacter.replace(CARD_TOKEN, BLANK)

  room.questionTextById ||= {}
  room.questionTextById[id] = text

  return { text, required }
}

export function initQuestionsForGame(room: ServerRoom): void {
  const all = buildAllQuestionIds()
  room.questionsDiscard = []
  room.questionTextById = {}
  room.questionsDrawPile = shuffle(all)
}
