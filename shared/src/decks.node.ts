import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Decks } from './index'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function readJsonArray(filePath: string): Promise<string[]> {
  const raw = await readFile(filePath, 'utf-8')
  const parsed = JSON.parse(raw)
  if (!Array.isArray(parsed)) throw new Error(`Deck inválido (no es array): ${filePath}`)
  return parsed as string[]
}

let cached: Decks | null = null

export async function loadDecks(): Promise<Decks> {
  if (cached) return cached

  const decksDir = path.join(__dirname, 'decks')

  const [questions, answers, characters] = await Promise.all([
    readJsonArray(path.join(decksDir, 'questions.json')),
    readJsonArray(path.join(decksDir, 'answers.json')),
    readJsonArray(path.join(decksDir, 'characters.json')),
  ])

  cached = { questions, answers, characters }
  return cached
}
