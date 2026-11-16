// The design-rules proof (docs/m0/12-design-rules.md). Two layers of rules, six compositions and six
// type systems, so 36 pages per business. Jev reads each salon brief and gives a probability for
// every rule in each layer; code then draws 20 designs for one brief by sampling pairs in proportion
// to those probabilities, so the same brief gives different sites that all fit it.
// All 36 pairs are checked in Chromium at 1440 and 390 px (overflow, elements sticking out, covered
// text, axe WCAG 2.2 AA), because any pair the rules allow must look right.
// Output: tools/eval/out/grammar/ (pages, shots, results.json).
// Run: pnpm --filter @repo/eval grammar        (SHOTS=0 skips the browser)
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import AxeBuilder from '@axe-core/playwright'
import {
  type ChoiceQuestion,
  type Copy,
  type Dist,
  openRouterText,
  randomDecisions,
  rng,
  typesafeDecisions,
} from '@repo/pipeline'
import { chromium } from 'playwright'
import { it } from 'vitest'
import { BRIEFS } from '../src/briefs.ts'
import { SAMPLES } from '../src/businesses.ts'
import { COMPOSITIONS } from '../src/grammar/compositions.ts'
import { contentOf, renderPage } from '../src/grammar/page.ts'
import { TYPE_RULES } from '../src/grammar/type-rules.ts'
import { pageProblems } from '../src/page-checks.ts'

try {
  process.loadEnvFile(new URL('../../../.env', import.meta.url).pathname)
} catch {
  // No .env file: the random stand-in answers.
}
const KEY = process.env.TYPESAFE_API_KEY
const OPENROUTER = process.env.OPENROUTER_API_KEY
const N = Number(process.env.N ?? 20)
const BRIEF = process.env.BRIEF ?? 'salon-1'

const out = new URL('../out/grammar/', import.meta.url)
for (const d of ['pages', 'shots']) mkdirSync(new URL(`${d}/`, out), { recursive: true })
const photosDir = new URL('../photos/', import.meta.url)
if (existsSync(photosDir)) cpSync(photosDir, new URL('pages/photos/', out), { recursive: true })
const manifest = JSON.parse(
  readFileSync(new URL('../photos/manifest.json', import.meta.url), 'utf8'),
) as Record<string, Record<string, { file: string; alt: string; width: number; height: number }>>

const questions: ChoiceQuestion[] = [
  {
    kind: 'choice',
    id: 'composition',
    prompt:
      "Which page layout would make the best website for this business, given the owner's description?",
    options: COMPOSITIONS.map((c) => ({ key: c.key, text: c.text })),
  },
  {
    kind: 'choice',
    id: 'type',
    prompt:
      "Which typography would make the best website for this business, given the owner's description?",
    options: TYPE_RULES.map((t) => ({ key: t.key, text: t.text })),
  },
]

/** Pairs drawn without repeats, each in proportion to p(composition) × p(type); rules under 4% are out. */
function sample(comp: Dist, type: Dist, n: number, seed: string) {
  const floor = 0.04
  const pairs = COMPOSITIONS.flatMap((c) =>
    TYPE_RULES.map((t) => ({ c: c.key, t: t.key, w: (comp[c.key] ?? 0) * (type[t.key] ?? 0) })),
  ).filter((p) => (comp[p.c] ?? 0) >= floor && (type[p.t] ?? 0) >= floor)
  const rand = rng(seed)
  const picked: typeof pairs = []
  const pool = [...pairs]
  while (picked.length < n && pool.length) {
    const total = pool.reduce((s, p) => s + p.w, 0)
    let r = rand() * total
    const i = Math.max(
      0,
      pool.findIndex((p) => {
        r -= p.w
        return r <= 0
      }),
    )
    picked.push(...pool.splice(i, 1))
  }
  return { picked, eligible: pairs.length }
}

/** Facts the words may mention (the same as the M0 run): area, address, access, booking, services. */
function factsOf(place: string): string {
  const s = SAMPLES.salon
  const loc = s.business.locations[0]
  const items = s.collections.flatMap((c) =>
    c.items.map((i) => ('name' in i ? String(i.name) : '')),
  )
  return [
    `Area: ${place}.`,
    loc?.address
      ? `Address: ${[...loc.address.lines, loc.address.locality, loc.address.postalCode].join(', ')}.`
      : '',
    loc?.note ? `Access and parking: ${loc.note}` : '',
    'Takes bookings online.',
    `What they offer: ${items.filter(Boolean).join('; ')}.`,
  ]
    .filter(Boolean)
    .join('\n')
}

it('renders the design-rules proof', async () => {
  const decide = KEY ? typesafeDecisions({ apiKey: KEY }) : randomDecisions('grammar')
  const salons = BRIEFS.filter((b) => b.kind === 'salon')

  // Jev's reading of every salon brief, both layers in one call per brief.
  const readings = await Promise.all(
    salons.map(async (b) => {
      const t0 = performance.now()
      const r = await decide.decide(
        {
          business: 'hair salon',
          name: b.name,
          place: b.place,
          owner_words: b.words,
        },
        questions,
      )
      const dist = (id: string): Dist => {
        const a = r.answers.get(id)
        return a?.kind === 'choice' && a.dist ? a.dist : {}
      }
      return {
        brief: b.id,
        place: b.place,
        name: b.name,
        words: b.words,
        color: b.color,
        composition: dist('composition'),
        type: dist('type'),
        ms: Math.round(performance.now() - t0),
        costUsd: r.calls.reduce((s, c) => s + (c.costUsd ?? 0), 0),
        error: r.calls.find((c) => c.error)?.error,
      }
    }),
  )
  // The words, written once per brief (the same words go into every design for that brief).
  const text = OPENROUTER ? openRouterText({ apiKey: OPENROUTER }) : null
  const words = new Map<string, { copy: Copy | null; ms: number; costUsd: number }>()
  await Promise.all(
    salons.map(async (b) => {
      if (!text) return
      const t0 = performance.now()
      const r = await text.write({ brief: b, facts: factsOf(b.place), needSteps: false })
      words.set(b.id, {
        copy: r.copy,
        ms: Math.round(performance.now() - t0),
        costUsd: r.calls.reduce((s, c) => s + (c.costUsd ?? 0), 0),
      })
    }),
  )
  const contentFor = (id: string) => {
    const b = salons.find((x) => x.id === id)
    const copy = words.get(id)?.copy
    return contentOf(SAMPLES.salon, manifest.salon ?? {}, 'photos/', {
      ...(b ? { name: b.name, brand: b.color } : {}),
      ...(copy ? { copy } : {}),
    })
  }

  const reading = readings.find((r) => r.brief === BRIEF)
  if (!reading) throw new Error(`no brief ${BRIEF}`)
  const { picked, eligible } = sample(reading.composition, reading.type, N, BRIEF)

  // Every pair, for the checks; the drawn designs are among them.
  const content = contentFor(BRIEF)
  const renderMs: number[] = []
  const pages: { file: string; c: string; t: string }[] = []
  for (const c of COMPOSITIONS)
    for (const t of TYPE_RULES) {
      const t0 = performance.now()
      const html = renderPage(content, c, t)
      renderMs.push(performance.now() - t0)
      const file = `${c.key}-${t.key}.html`
      writeFileSync(new URL(`pages/${file}`, out), html)
      pages.push({ file, c: c.key, t: t.key })
    }
  // Jev's first choice for each of the other briefs, in their own words and colour.
  const top = (d: Dist) => Object.entries(d).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ''
  const others = readings
    .filter((r) => r.brief !== BRIEF)
    .map((r) => ({ brief: r.brief, c: top(r.composition), t: top(r.type) }))
  for (const o of others) {
    const c = COMPOSITIONS.find((x) => x.key === o.c)
    const t = TYPE_RULES.find((x) => x.key === o.t)
    if (!c || !t) continue
    const file = `brief-${o.brief}.html`
    writeFileSync(new URL(`pages/${file}`, out), renderPage(contentFor(o.brief), c, t))
    pages.push({ file, c: c.key, t: t.key })
  }

  const problems: Record<string, string[]> = {}
  if (process.env.SHOTS !== '0') {
    const browser = await chromium.launch()
    const only = process.env.ONLY?.split(',')
    for (const p of pages.filter((x) => !only || only.some((o) => x.file.includes(o)))) {
      const found: string[] = []
      for (const width of [1440, 390]) {
        const ctx = await browser.newContext({
          viewport: { width, height: width > 500 ? 900 : 844 },
          deviceScaleFactor: 1,
        })
        const page = await ctx.newPage()
        await page.goto(new URL(`pages/${p.file}`, out).href, { waitUntil: 'networkidle' })
        await page.evaluate(() => document.fonts.ready)
        // Scroll through once so lazy photos load before the full-page screenshot.
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 600) {
            window.scrollTo(0, y)
            await new Promise((r) => setTimeout(r, 60))
          }
          window.scrollTo(0, 0)
        })
        await page.waitForLoadState('networkidle')
        found.push(...(await page.evaluate(pageProblems)).map((x) => `${width}px: ${x}`))
        const axe = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze()
        for (const v of axe.violations)
          found.push(
            `${width}px: axe ${v.id} (${v.nodes.length}) ${v.nodes[0]?.target.join(' ') ?? ''}`,
          )
        const tag = width > 500 ? 'desktop' : 'phone'
        const base = p.file.replace('.html', '')
        await page.screenshot({
          path: new URL(`shots/${base}-${tag}-top.jpg`, out).pathname,
          quality: 72,
        })
        await page.screenshot({
          path: new URL(`shots/${base}-${tag}-full.jpg`, out).pathname,
          fullPage: true,
          quality: 62,
        })
        await ctx.close()
      }
      if (found.length) problems[p.file] = found
    }
    await browser.close()
  }

  const sorted = [...renderMs].sort((a, b) => a - b)
  writeFileSync(
    new URL('results.json', out),
    JSON.stringify(
      {
        decider: `${decide.id}:${decide.model}`,
        brief: BRIEF,
        readings,
        words: Object.fromEntries(words),
        others,
        eligiblePairs: eligible,
        designs: picked.map((p, i) => ({ n: i + 1, composition: p.c, type: p.t, weight: p.w })),
        renderMsMedian: sorted[Math.floor(sorted.length / 2)],
        problems,
      },
      null,
      2,
    ),
  )
}, 1_800_000)
