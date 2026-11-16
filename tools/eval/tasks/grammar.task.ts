// The design-rules proof, round 3 (docs/m0/14-design-rules-3.md; rounds 1 and 2 in 12 and 13).
// Six layers of rules: composition, type, colour, hero, signature detail and, new, photo treatment.
// Round 3 adds the atmospheric direction from Robert's reference picks: low-key photos, deep or
// near-black pages, a quiet opening and restraint. For each salon brief: three atmospheric designs
// (Jev chooses within the direction) and Jev's open pick across every rule, for comparison.
// Checked in Chromium at 1440 and 390 px: overflow, sticking out, covered text, axe WCAG 2.2 AA and
// the tell linter, plus a random sample across all rules without screenshots.
// Output: tools/eval/out/grammar-3/. Run: pnpm --filter @repo/eval grammar   (SHOTS=0, EXTRA=n)
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import AxeBuilder from '@axe-core/playwright'
import {
  type Copy,
  type DecisionPort,
  openRouterText,
  randomDecisions,
  rng,
  typesafeDecisions,
} from '@repo/pipeline'
import { chromium } from 'playwright'
import { it } from 'vitest'
import { BRIEFS } from '../src/briefs.ts'
import { SAMPLES } from '../src/businesses.ts'
import {
  ATMOSPHERIC,
  design,
  LAYERS,
  OPEN,
  type Pick,
  pickDesigns,
  type RuleCache,
  readBrief,
  staleRules,
  weigh,
} from '../src/grammar/choose.ts'
import { palettePairs } from '../src/grammar/colour-rules.ts'
import { contentOf, renderPage } from '../src/grammar/page.ts'
import { ruleProfile } from '../src/grammar/profiles.ts'
import { tells } from '../src/grammar/tells.ts'
import { pageProblems } from '../src/page-checks.ts'

try {
  process.loadEnvFile(new URL('../../../.env', import.meta.url).pathname)
} catch {
  // No .env file: the random stand-in answers.
}
const KEY = process.env.TYPESAFE_API_KEY
const OPENROUTER = process.env.OPENROUTER_API_KEY
const EXTRA = Number(process.env.EXTRA ?? 40)

const out = new URL('../out/grammar-3/', import.meta.url)
for (const d of ['pages', 'shots']) mkdirSync(new URL(`${d}/`, out), { recursive: true })
const photosDir = new URL('../photos/', import.meta.url)
if (existsSync(photosDir)) cpSync(photosDir, new URL('pages/photos/', out), { recursive: true })
const manifest = JSON.parse(
  readFileSync(new URL('../photos/manifest.json', import.meta.url), 'utf8'),
) as Record<string, Record<string, { file: string; alt: string; width: number; height: number }>>

/** Rule profiles, cached by layer, key and description: a changed description is scored again. */
const cacheFile = new URL('../src/grammar/rule-profiles.json', import.meta.url)
async function ruleProfiles(decide: DecisionPort) {
  const cache: RuleCache = existsSync(cacheFile) ? JSON.parse(readFileSync(cacheFile, 'utf8')) : {}
  let cost = 0
  const todo = staleRules(cache)
  await Promise.all(
    todo.map(async (r) => {
      const p = await ruleProfile(decide, r.name, r.text)
      cost += p.calls.reduce((s, c) => s + (c.costUsd ?? 0), 0)
      cache[`${r.layer}/${r.key}`] = { text: r.text, profile: p.profile }
    }),
  )
  if (todo.length && decide.id !== 'random')
    writeFileSync(cacheFile, `${JSON.stringify(cache, null, 2)}\n`)
  return { cache, scored: todo.length, cost }
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
    'Opened in 2009.',
    'Takes bookings online.',
    `What they offer: ${items.filter(Boolean).join('; ')}.`,
  ]
    .filter(Boolean)
    .join('\n')
}

it('renders the design-rules proof, round 3', async () => {
  const decide = KEY ? typesafeDecisions({ apiKey: KEY }) : randomDecisions('grammar-3')
  const text = OPENROUTER ? openRouterText({ apiKey: OPENROUTER }) : null
  const salons = BRIEFS.filter((b) => b.kind === 'salon')
  const rules = await ruleProfiles(decide)

  // Per brief, in parallel: Jev's reading of the brief and the words, as the product would.
  const briefs = await Promise.all(
    salons.map(async (b) => {
      const t0 = performance.now()
      const [p, w] = await Promise.all([
        readBrief(decide, { business: 'hair salon', name: b.name, place: b.place, words: b.words }),
        text ? text.write({ brief: b, facts: factsOf(b.place), needSteps: false }) : null,
      ])
      return {
        brief: b,
        profile: p.profile,
        direct: p.direct,
        copy: (w?.copy ?? null) as Copy | null,
        ms: Math.round(performance.now() - t0),
        jevUsd: p.calls.reduce((s, c) => s + (c.costUsd ?? 0), 0),
        textUsd: w?.calls.reduce((s, c) => s + (c.costUsd ?? 0), 0) ?? 0,
      }
    }),
  )

  type Page = {
    file: string
    brief: string
    direction: string
    pick: Pick
    shots: boolean
    pairs: Record<string, number>
  }
  const pages: Page[] = []
  const renderMs: number[] = []
  const records = briefs.map((b) => {
    const c = contentOf(SAMPLES.salon, manifest.salon ?? {}, 'photos/', {
      name: b.brief.name,
      brand: b.brief.color,
      founded: 2009,
      ...(b.copy ? { copy: b.copy } : {}),
    })
    const atmos = pickDesigns(weigh(b.profile, b.direct, rules.cache, c, ATMOSPHERIC), b.brief.id)
    const open = pickDesigns(weigh(b.profile, b.direct, rules.cache, c, OPEN), b.brief.id, 1)
    const all = [
      ...atmos.map((p, i) => ({
        p,
        file: `${b.brief.id}-a${i + 1}.html`,
        direction: 'atmospheric',
      })),
      ...open.map((p) => ({ p, file: `${b.brief.id}-open.html`, direction: 'open' })),
    ]
    for (const x of all) {
      const t0 = performance.now()
      const d = design(x.p)
      writeFileSync(new URL(`pages/${x.file}`, out), renderPage(c, d))
      renderMs.push(performance.now() - t0)
      pages.push({
        file: x.file,
        brief: b.brief.id,
        direction: x.direction,
        pick: x.p,
        shots: true,
        pairs: palettePairs(d.colour.palette(c.brand)),
      })
    }
    return { ...b, content: c, atmos, open: open[0] }
  })

  // Robustness: random designs across every rule, checked but not photographed.
  const rand = rng('grammar-3-extra')
  const any = <T>(xs: readonly T[]) => xs[Math.floor(rand() * xs.length)] as T
  for (let i = 0; i < EXTRA; i++) {
    const r = any(records)
    const c = r.content
    const w = weigh(r.profile, r.direct, rules.cache, c, OPEN)
    const p = Object.fromEntries(
      (Object.keys(LAYERS) as (keyof typeof LAYERS)[]).map((l) => [l, any(w[l]).key]),
    ) as Pick
    const d = design(p)
    const file = `extra-${String(i + 1).padStart(2, '0')}.html`
    writeFileSync(new URL(`pages/${file}`, out), renderPage(c, d))
    pages.push({
      file,
      brief: r.brief.id,
      direction: 'random',
      pick: p,
      shots: false,
      pairs: palettePairs(d.colour.palette(c.brand)),
    })
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
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 600) {
            window.scrollTo(0, y)
            await new Promise((r) => setTimeout(r, 40))
          }
          window.scrollTo(0, 0)
        })
        await page.waitForLoadState('networkidle')
        found.push(...(await page.evaluate(pageProblems)).map((x) => `${width}px: ${x}`))
        const allowed =
          p.pick.composition === 'framed' || p.pick.hero === 'quiet' ? ['everything centred'] : []
        found.push(...(await page.evaluate(tells, allowed)).map((x) => `${width}px: tell, ${x}`))
        const axe = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze()
        for (const v of axe.violations)
          found.push(
            `${width}px: axe ${v.id} (${v.nodes.length}) ${v.nodes[0]?.target.join(' ') ?? ''}`,
          )
        if (p.shots) {
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
        }
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
        rulesScored: rules.scored,
        rulesScoringUsd: rules.cost,
        briefs: records.map((r) => ({
          brief: r.brief.id,
          name: r.brief.name,
          words: r.brief.words,
          color: r.brief.color,
          profile: r.profile,
          ms: r.ms,
          jevUsd: r.jevUsd,
          textUsd: r.textUsd,
          headline: r.copy?.headline,
          atmos: r.atmos,
          open: r.open,
        })),
        pages: pages.map(({ content: _c, ...p }: Page & { content?: unknown }) => p),
        renderMsMedian: sorted[Math.floor(sorted.length / 2)],
        problems,
      },
      null,
      2,
    ),
  )
}, 3_600_000)
