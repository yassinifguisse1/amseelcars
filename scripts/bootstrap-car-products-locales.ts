/**
 * Fills `messages/car-products.{es,de,pl}.json` for slugs that still mirror English (machine translation).
 * Slugs that already differ from EN (e.g. hand-translated BMW X3) are left unchanged.
 *
 * Requires network (Google Translate endpoints via `google-translate-api-x`).
 * Run after `pnpm run generate:car-products` when you add new fleet models, or to refresh MT for mirrors only.
 *
 * Usage:
 *   pnpm run bootstrap:car-products-locales
 *   pnpm exec tsx scripts/bootstrap-car-products-locales.ts --locale=es
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import translate from 'google-translate-api-x'
import { getAllCars } from '../src/data/cars'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

type ProductPack = { description: string; richContent?: unknown }

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value)
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`
  }
  const obj = value as Record<string, unknown>
  const keys = Object.keys(obj).sort()
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(',')}}`
}

function mirrorsEnglish(cur: ProductPack | undefined, enPack: ProductPack): boolean {
  if (!cur?.description?.trim()) return true
  if (cur.description.trim() !== enPack.description.trim()) return false
  return stableStringify(cur.richContent) === stableStringify(enPack.richContent)
}

function collectStrings(value: unknown, out: Set<string>): void {
  if (typeof value === 'string') {
    if (value.length) out.add(value)
    return
  }
  if (Array.isArray(value)) {
    for (const x of value) collectStrings(x, out)
    return
  }
  if (value && typeof value === 'object') {
    for (const v of Object.values(value)) collectStrings(v, out)
  }
}

function applyStringMap(value: unknown, dict: Map<string, string>): unknown {
  if (typeof value === 'string') {
    return dict.has(value) ? dict.get(value)! : value
  }
  if (Array.isArray(value)) {
    return value.map((x) => applyStringMap(x, dict))
  }
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    const next: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(obj)) {
      next[k] = applyStringMap(v, dict)
    }
    return next
  }
  return value
}

const MAX_CHUNK = 4200
const BATCH = 8
const PAUSE_MS = 400

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

async function translateOneWithRetries(s: string, to: 'es' | 'de' | 'pl'): Promise<string> {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await translate(s, {
        from: 'en',
        to,
        forceBatch: false,
        fallbackBatch: true,
      })
      return res.text
    } catch {
      await sleep(800 * (attempt + 1))
    }
  }
  throw new Error(`translate failed after retries: "${s.slice(0, 80)}…"`)
}

async function translateUniqueStrings(
  strings: string[],
  to: 'es' | 'de' | 'pl',
): Promise<Map<string, string>> {
  const dict = new Map<string, string>()
  const unique = [...new Set(strings)]

  const longOnes = unique.filter((s) => s.length > MAX_CHUNK)
  const shortOnes = unique.filter((s) => s.length <= MAX_CHUNK)

  for (const s of longOnes) {
    let acc = ''
    for (let i = 0; i < s.length; i += MAX_CHUNK) {
      const slice = s.slice(i, i + MAX_CHUNK)
      acc += await translateOneWithRetries(slice, to)
      await sleep(PAUSE_MS)
    }
    dict.set(s, acc)
  }

  for (let i = 0; i < shortOnes.length; i += BATCH) {
    const batch = shortOnes.slice(i, i + BATCH)
    const res = await translate(batch, {
      from: 'en',
      to,
      forceBatch: true,
      rejectOnPartialFail: false,
    })
    if (!Array.isArray(res)) throw new Error('Expected batch translation array')
    for (let j = 0; j < batch.length; j++) {
      const orig = batch[j]
      const cell = res[j]
      const text = cell?.text
      if (text != null && text.length > 0) {
        dict.set(orig, text)
      } else {
        dict.set(orig, await translateOneWithRetries(orig, to))
        await sleep(PAUSE_MS)
      }
    }
    await sleep(PAUSE_MS)
  }

  return dict
}

const TARGETS = ['es', 'de', 'pl'] as const

async function main(): Promise<void> {
  const arg = process.argv.find((a) => a.startsWith('--locale='))
  const only = arg?.split('=')[1] as (typeof TARGETS)[number] | undefined
  const locales = only && (TARGETS as readonly string[]).includes(only) ? [only] : [...TARGETS]

  const enPath = join(root, 'messages/car-products.en.json')
  const en = JSON.parse(readFileSync(enPath, 'utf8')) as Record<string, ProductPack>
  const slugs = getAllCars().map((c) => c.slug)

  for (const locale of locales) {
    const curPath = join(root, `messages/car-products.${locale}.json`)
    const cur = JSON.parse(readFileSync(curPath, 'utf8')) as Record<string, ProductPack>

    const mirrorSlugs = slugs.filter((slug) => mirrorsEnglish(cur[slug], en[slug]))
    if (mirrorSlugs.length === 0) {
      console.log(`[${locale}] Nothing to translate (all slugs already localized).`)
      continue
    }

    console.log(`[${locale}] Translating ${mirrorSlugs.length} slug(s)…`)

    const allStrings = new Set<string>()
    for (const slug of mirrorSlugs) {
      collectStrings(en[slug], allStrings)
    }

    const dict = await translateUniqueStrings([...allStrings], locale)
    const out: Record<string, ProductPack> = { ...cur }

    for (const slug of slugs) {
      if (mirrorSlugs.includes(slug)) {
        const cloned = JSON.parse(JSON.stringify(en[slug])) as ProductPack
        out[slug] = applyStringMap(cloned, dict) as ProductPack
      }
    }

    writeFileSync(curPath, JSON.stringify(out, null, 2) + '\n')
    console.log(`[${locale}] Wrote ${curPath}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
