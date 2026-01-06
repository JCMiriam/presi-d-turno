import questions from './decks/questions.json'
import answers from './decks/answers.json'
import characters from './decks/characters.json'

export type Decks = {
  questions: string[]
  answers: string[]
  characters: string[]
}

export const decks: Decks = {
  questions: questions as string[],
  answers: answers as string[],
  characters: characters as string[],
}
