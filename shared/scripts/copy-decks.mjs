import { cp, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const src = path.join(__dirname, '..', 'src', 'decks')
const dest = path.join(__dirname, '..', 'dist', 'decks')

if (!existsSync(src)) {
  console.error(`❌ No existe la carpeta de decks: ${src}`)
  process.exit(1)
}

await mkdir(dest, { recursive: true })
await cp(src, dest, { recursive: true })

console.log(`✅ Decks copiados: ${src} -> ${dest}`)
