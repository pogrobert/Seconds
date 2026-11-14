// M0, the taste test (docs/technical/README.md, Build order, steps 3 and 4). For each brief:
// - the text model writes the words once (OpenRouter), and every arm uses them;
// - arm A: the decision model (TypeSafe's Jev) answers the compiled questions; code picks variants;
// - arm B: the code defaults for that kind of business;
// - arm C: the same questions answered at random from a seed.
// Each site is rendered and checked in Chromium at 360 and 1280 px (overflow, elements sticking out,
// covered text, axe WCAG 2.2 AA). Records keep every request and response.
// Without TYPESAFE_API_KEY or OPENROUTER_API_KEY in the project's .env, the missing model is replaced
// by a stand-in (random decisions, the sample's fixed words) and the run is named "standin": it
// tests the plumbing only and says nothing about taste.
// Output: tools/eval/out/m0/<run>/ with sites/, shots/, records/, results.json, summary.md and
// pairs-key.json (which side of each blind pair is which; never shown on the rating page).
// Run: pnpm --filter @repo/eval m0     or    BRIEFS=salon-1,clinic-3 pnpm --filter @repo/eval m0
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import AxeBuilder from '@axe-core/playwright'
import { manifests } from '@repo/blocks/manifest'
import {
  type Brief,
  type Copy,
  compileQuestions,
  defaultSite,
  fixedText,
  generateSite,
  type Look,
  openRouterText,
  randomDecisions,
  resolveSite,
  rng,
  type SitePlan,
  typesafeDecisions,
} from '@repo/pipeline'
import { chromium } from 'playwright'
import { expect, it } from 'vitest'
import { BRIEFS } from '../src/briefs.ts'
import { type Kind, SAMPLES, type SampleBusiness } from '../src/businesses.ts'
import { pageProblems } from '../src/page-checks.ts'
import { QUERIES } from '../src/photos.ts'
import { renderSample } from '../src/render-sample.ts'
import { contentFor, eligibleFor, photoOrder } from '../src/site-content.ts'

try {
  process.loadEnvFile(new URL('../../../.env', import.meta.url).pathname)
} catch {
  // No .env file: stand-ins only.
}
const TYPESAFE = process.env.TYPESAFE_API_KEY
const OPENROUTER = process.env.OPENROUTER_API_KEY
const RUN = process.env.RUN ?? (TYPESAFE && OPENROUTER ? 'live' : 'standin')
const only = process.env.BRIEFS?.split(',').map((x) => x.trim())
const briefs = only ? BRIEFS.filter((b) => only.includes(b.id)) : BRIEFS

const out = new URL(`../out/m0/${RUN}/`, import.meta.url)
for (const d of ['sites', 'shots', 'records']) mkdirSync(new URL(`${d}/`, out), { recursive: true })
const photosDir = new URL('../photos/', import.meta.url)
if (existsSync(photosDir)) cpSync(photosDir, new URL('photos/', out), { recursive: true })

/** The photos that can lead, described for the decision model. Photo 3 never leads. */
const leadPhotos = (kind: Kind) =>
  (
    [
      [1, 'hero'],
      [2, 'about'],
      [4, 'detail-1'],
      [5, 'detail-2'],
    ] as const
  ).map(([n, slot]) => ({ n, shows: QUERIES[kind][slot] }))

/** The brief's business: the sample's facts under the brief's name and colour. */
const businessOf = (brief: Brief): SampleBusiness => {
  const s = SAMPLES[brief.kind]
  return { ...s, business: { ...s.business, name: brief.name }, palette: brief.color }
}

/** Facts the words may mention. Prices, hours and contact details are shown from the record. */
function factsOf(s: SampleBusiness, brief: Brief): string {
  const loc = s.business.locations?.[0]
  const items = s.collections.flatMap((c) =>
    c.items.map((i) => ('name' in i ? String(i.name) : '')),
  )
  return [
    `Area: ${brief.place}.`,
    loc?.note ? `Getting there: ${loc.note}` : '',
    s.business.bookingUrl ? 'Takes bookings online.' : 'Takes bookings by phone.',
    `What they offer: ${items.filter(Boolean).join('; ')}.`,
  ]
    .filter(Boolean)
    .join('\n')
}

/** The stand-in words when no text key is set: the sample's own, under the brief's name. */
const standInCopy = (brief: Brief): Copy => {
  const t = SAMPLES[brief.kind].standIn
  const name = SAMPLES[brief.kind].business.name
  const swap = (x: string) => x.split(name).join(brief.name)
  return { ...t, about: swap(t.about), cta: { ...t.cta } }
}

type Arm = 'a' | 'b' | 'c'
type ArmSite = { plan: SitePlan; look: Look; ineligible: string[] }
type Result = {
  brief: string
  kind: Kind
  failed?: string
  ms?: { decide: number; text: number; total: number }
  costUsd?: { decide: number; text: number }
  textRetries?: number
  defaults?: number
  arms: Partial<
    Record<
      Arm,
      {
        file: string
        blocks: string[]
        style: unknown
        look: Look
        problems: string[]
        ineligible: string[]
      }
    >
  >
}

it(`M0 run "${RUN}": ${briefs.length} briefs, three arms each`, async () => {
  const results: Result[] = []
  const sites: { file: string; arm: Arm; brief: string }[] = []

  for (const brief of briefs) {
    const sample = businessOf(brief)
    const photos = leadPhotos(brief.kind)
    const decide = TYPESAFE
      ? typesafeDecisions({ apiKey: TYPESAFE })
      : randomDecisions(`standin-${brief.id}`)
    const text = OPENROUTER
      ? openRouterText({ apiKey: OPENROUTER })
      : fixedText(() => standInCopy(brief))
    const eligible = (copy: Copy, look: Look) =>
      eligibleFor({ ...sample, standIn: copy }, photoOrder(look.leadPhoto))

    let gen: Awaited<ReturnType<typeof generateSite>>
    try {
      gen = await generateSite(
        { brief, photos, facts: factsOf(sample, brief) },
        { decide, text, manifests, eligible },
      )
    } catch (e) {
      const record = (e as { record?: unknown }).record
      writeFileSync(
        new URL(`records/${brief.id}.json`, out),
        JSON.stringify({ brief, record }, null, 2),
      )
      results.push({ brief: brief.id, kind: brief.kind, failed: (e as Error).message, arms: {} })
      continue
    }
    const copy = gen.copy
    const withCopy = { ...sample, standIn: copy }
    const fits = (plan: SitePlan, look: Look) => {
      const ok = eligibleFor(withCopy, photoOrder(look.leadPhoto))
      return [...plan.before, ...plan.sections, ...plan.after]
        .filter((s) => !ok(s))
        .map((s) => `${s.type}#${s.variant}`)
    }

    // Arm C: the same questions, answered at random.
    const compiled = compileQuestions(brief.kind, photos, manifests)
    const randomAnswers = await randomDecisions(`arm-c-${brief.id}`).decide(
      {},
      compiled.map((c) => c.question),
    )
    const c = resolveSite(
      brief.kind,
      compiled,
      randomAnswers.answers,
      manifests,
      eligible(copy, { leadPhoto: 1 }),
    )
    const b = defaultSite(brief.kind)
    const arms: Record<Arm, ArmSite> = {
      a: { plan: gen.plan, look: gen.look, ineligible: fits(gen.plan, gen.look) },
      b: { ...b, ineligible: fits(b.plan, b.look) },
      c: { plan: c.plan, look: c.look, ineligible: fits(c.plan, c.look) },
    }

    const result: Result = {
      brief: brief.id,
      kind: brief.kind,
      ms: gen.record.ms,
      costUsd: gen.record.costUsd,
      textRetries: gen.record.text.calls.length - 1,
      defaults: gen.record.decided.filter((d) => d.source !== 'model').length,
      arms: {},
    }
    for (const arm of ['a', 'b', 'c'] as const) {
      const { plan, look, ineligible } = arms[arm]
      const r = await renderSample(brief.kind, {
        plan,
        sample: withCopy,
        brand: brief.color,
        photoBase: '../photos/',
        content: contentFor(withCopy, photoOrder(look.leadPhoto)),
      })
      expect(r.problems, `${brief.id} arm ${arm}: spec problems`).toEqual([])
      const file = `${brief.id}-${arm}.html`
      writeFileSync(new URL(`sites/${file}`, out), r.html)
      sites.push({ file, arm, brief: brief.id })
      result.arms[arm] = {
        file,
        blocks: [...plan.before, ...plan.sections, ...plan.after].map(
          (s) => `${s.type}#${s.variant} (${s.surface ?? 'base'})`,
        ),
        style: plan.style,
        look,
        problems: [],
        ineligible,
      }
    }
    writeFileSync(
      new URL(`records/${brief.id}.json`, out),
      JSON.stringify({ brief, copy, record: gen.record, arms }, null, 2),
    )
    results.push(result)
  }

  // Check every site in a real browser, with the real fonts.
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()
  for (const s of sites) {
    const found: string[] = []
    for (const width of [360, 1280]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(new URL(`sites/${s.file}`, out).href, { waitUntil: 'networkidle' })
      await page.evaluate(() => document.fonts.ready)
      found.push(...(await page.evaluate(pageProblems)).map((x) => `${width}px: ${x}`))
      const axe = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
      for (const v of axe.violations)
        found.push(
          `${width}px: axe ${v.id} (${v.nodes.length}) ${v.nodes[0]?.target.join(' ') ?? ''}`,
        )
      const shot = s.file.replace('.html', '')
      if (width === 1280) {
        await page.screenshot({ path: new URL(`shots/${shot}.png`, out).pathname })
        await page.screenshot({
          path: new URL(`shots/${shot}-full.png`, out).pathname,
          fullPage: true,
        })
      } else
        await page.screenshot({
          path: new URL(`shots/${shot}-phone.png`, out).pathname,
          fullPage: true,
        })
    }
    const r = results.find((x) => x.brief === s.brief)?.arms[s.arm]
    if (r) r.problems = found
  }
  await browser.close()

  // Blind pairs: A against B and A against C, sides drawn from a seed. The key stays in this folder.
  const rand = rng(`m0-pairs-${RUN}`)
  const pairs = results
    .filter((r) => !r.failed)
    .flatMap((r) =>
      (['b', 'c'] as const).map((other) => {
        const left = rand() < 0.5 ? 'a' : other
        return {
          id: `${r.brief}-${other}`,
          brief: r.brief,
          left,
          right: left === 'a' ? other : 'a',
        }
      }),
    )
  writeFileSync(new URL('pairs-key.json', out), JSON.stringify(pairs, null, 2))
  writeFileSync(new URL('results.json', out), JSON.stringify(results, null, 2))
  writeFileSync(new URL('summary.md', out), summary(results))
}, 1_800_000)

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b)
  return s.length ? (s[Math.floor((s.length - 1) / 2)] as number) : Number.NaN
}

function summary(results: Result[]): string {
  const ok = results.filter((r) => r.ms)
  const col = (f: (r: Result) => number) => ok.map(f)
  const fmt = (xs: number[], unit: string, d = 0) =>
    xs.length
      ? `median ${median(xs).toFixed(d)}${unit}, slowest ${Math.max(...xs).toFixed(d)}${unit}`
      : 'none'
  const rows = results.map((r) => {
    const probs = (['a', 'b', 'c'] as const)
      .map((a) => r.arms[a]?.problems.length ?? '–')
      .join(' / ')
    const inel = (['a', 'b', 'c'] as const)
      .map((a) => r.arms[a]?.ineligible.length ?? '–')
      .join(' / ')
    return r.failed
      ? `| ${r.brief} | failed: ${r.failed} | | | | | |`
      : `| ${r.brief} | ${r.ms?.decide} | ${r.ms?.text} | ${r.ms?.total} | ${((r.costUsd?.decide ?? 0) + (r.costUsd?.text ?? 0)).toFixed(5)} | ${r.textRetries} | ${r.defaults} | ${probs} | ${inel} |`
  })
  return [
    `# M0 run "${RUN}"`,
    '',
    `Measured on this computer, not on Cloudflare. Decision model: ${TYPESAFE ? 'TypeSafe jev-1.14.0' : 'stand-in (random)'}. Text model: ${OPENROUTER ? 'OpenRouter openai/gpt-oss-120b' : 'stand-in (fixed words)'}.`,
    '',
    `- Briefs: ${results.length}, failed: ${results.filter((r) => r.failed).length}`,
    `- Decision call: ${fmt(
      col((r) => r.ms?.decide ?? 0),
      ' ms',
    )}`,
    `- Text call: ${fmt(
      col((r) => r.ms?.text ?? 0),
      ' ms',
    )}`,
    `- Both together: ${fmt(
      col((r) => r.ms?.total ?? 0),
      ' ms',
    )}`,
    `- Model cost per site: ${fmt(
      col((r) => (r.costUsd?.decide ?? 0) + (r.costUsd?.text ?? 0)),
      ' $',
      5,
    )}`,
    `- Page problems (A / B / C): ${(['a', 'b', 'c'] as const).map((a) => results.reduce((n, r) => n + (r.arms[a]?.problems.length ?? 0), 0)).join(' / ')}`,
    '',
    '| Brief | Decide ms | Text ms | Total ms | Cost $ | Text retries | Defaults used | Page problems A/B/C | Blocks that cannot hold the words A/B/C |',
    '|---|---|---|---|---|---|---|---|---|',
    ...rows,
    '',
  ].join('\n')
}
