// The Wall preview (docs/m0/02, step 5; M1's Wall in miniature): one business, 24 sites. Each site
// draws its family (Poster, Quiet, Soft in turn), its settings (font pairing, palette, corners,
// spacing, framing), light or dark, its page rhythm and a block variant per section at random from
// what the content fits. The words are the same on every site.
// Every site is checked in Chromium at 360 and 1280 px: page wider than the window, elements
// sticking out, and axe WCAG 2.2 AA with the real fonts. Problems are listed, not hidden.
// Output: tools/eval/out/wall/<kind>/site-NN.html, wall.json (what each site chose), problems.json,
//   wall.png (a contact sheet of the first screen of every site).
// Run: pnpm --filter @repo/eval wall     or    KIND=restaurant SITES=12 pnpm --filter @repo/eval wall
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import AxeBuilder from '@axe-core/playwright'
import { type BlockManifest, eligibility, manifests } from '@repo/blocks/manifest'
import { familyAxes, M0_FAMILIES } from '@repo/blocks/themes'
import {
  applyRhythm,
  DEFAULT_PLANS,
  RHYTHM_NAMES,
  rng,
  type SectionPlan,
  type SitePlan,
} from '@repo/pipeline'
import { chromium } from 'playwright'
import { expect, it } from 'vitest'
import { KINDS, type Kind, SAMPLES } from '../src/businesses.ts'
import { renderSample } from '../src/render-sample.ts'
import { standInContent } from '../src/stand-in.ts'

const kind = (process.env.KIND ?? 'salon') as Kind
const COUNT = Number(process.env.SITES ?? 24)
if (!KINDS.includes(kind)) throw new Error(`KIND must be one of ${KINDS.join(', ')}`)

const out = new URL(`../out/wall/${kind}/`, import.meta.url)
mkdirSync(out, { recursive: true })
const photos = new URL(`../photos/${kind}/`, import.meta.url)
if (existsSync(photos)) cpSync(photos, new URL(`photos/${kind}/`, out), { recursive: true })

const sample = SAMPLES[kind]
const aid = (n: number) => `a_${kind.slice(0, 4).padEnd(4, 'x')}${String(n).padStart(6, '0')}`
const img = (n: number) => ({ asset: aid(n), alt: `Inside ${sample.business.name}` })

/**
 * The stand-in content, with every picture a variant can show: a gallery, a photo, item photos.
 * A variant only uses the fields it names, so extra fields change nothing for the others.
 */
function wallContent(m: BlockManifest, variant: string, sec: SectionPlan) {
  const c = standInContent(sample, { ...sec, type: m.type, variant: 'rich' })
  const v = m.variants[variant]
  const uses = new Set<string>([
    ...((v?.uses ?? []) as readonly string[]),
    ...((v?.requires ?? []) as readonly string[]),
  ])
  // A section has a photo or a gallery, never both (the spec's rule): a gallery only where the
  // variant needs one or shows no single photo.
  const requires = new Set<string>((v?.requires ?? []) as readonly string[])
  const gallery = () =>
    [2, 4, 5].map((n, k) => ({ id: `i_${String(950 + k).padStart(10, '0')}`, image: img(n) }))
  if (requires.has('gallery') || (uses.has('gallery') && !uses.has('media'))) {
    c.gallery = c.gallery ?? gallery()
    delete c.media
  } else if (uses.has('media')) {
    c.media = c.media ?? img(sec.sectionType === 'cta' ? 3 : 2)
    delete c.gallery
  }
  if (v && v.signature.media !== 'none' && Array.isArray(c.items))
    c.items = (c.items as Record<string, unknown>[]).map((it, i) => ({
      ...it,
      media: img([4, 5, 2, 3][i % 4] as number),
    }))
  if (uses.has('form') && c.form === undefined)
    c.form = { form: 'f_newsletter', kind: 'newsletter' }
  return c
}

type Choice = { type: string; variant: string }
const chosen = new Map<string, Choice & { content: Record<string, unknown> }>()

/** One site of the Wall: its family, settings, mode, rhythm and variants, from a seed. */
function wallPlan(i: number): { plan: SitePlan; label: Record<string, string> } {
  const rand = rng(`${kind}-wall-${i}`)
  const pick = <T>(xs: readonly T[]): T => xs[Math.floor(rand() * xs.length)] as T
  const family = M0_FAMILIES[i % M0_FAMILIES.length] as (typeof M0_FAMILIES)[number]
  const lists = familyAxes(family)
  const axes = Object.fromEntries(Object.entries(lists).map(([a, vs]) => [a, pick(vs)]))
  const mode = rand() < 0.17 ? ('dark' as const) : ('light' as const)
  const rhythm = pick(RHYTHM_NAMES)
  const base = DEFAULT_PLANS[kind]
  const redraw = (sec: SectionPlan, n: number): SectionPlan => {
    const options = manifests
      .filter((m) => m.sectionType === sec.sectionType)
      .flatMap((m) => Object.keys(m.variants).map((variant) => ({ m, variant })))
      .filter(({ m, variant }) => eligibility(m, variant, wallContent(m, variant, sec)).ok)
    const o = pick(options)
    const content = wallContent(o.m, o.variant, sec)
    chosen.set(`${i}:${n}`, { type: o.m.type, variant: o.variant, content })
    return { ...sec, type: o.m.type, variant: o.variant }
  }
  let n = 0
  const plan = applyRhythm(
    {
      before: base.before.map((s) => redraw(s, n++)),
      sections: base.sections.map((s) => redraw(s, n++)),
      after: base.after.map((s) => redraw(s, n++)),
      style: { family: `${family}@1`, axes, mode },
    },
    rhythm,
  )
  return { plan, label: { family, ...axes, mode, rhythm } }
}

const overflow = () => {
  const vw = document.documentElement.clientWidth
  const found: string[] = []
  if (document.documentElement.scrollWidth > vw + 1)
    found.push(`page is ${document.documentElement.scrollWidth}px wide`)
  for (const el of Array.from(document.body.querySelectorAll('*'))) {
    const r = el.getBoundingClientRect()
    if (r.width <= 1 && r.height <= 1) continue
    if (r.right > vw + 1 || r.left < -1) {
      const block = el.closest('[data-block-type]')
      found.push(
        `${block?.getAttribute('data-block-type')}#${block?.getAttribute('data-variant')}: <${el.tagName.toLowerCase()}> sticks out`,
      )
    }
  }
  return [...new Set(found)].slice(0, 5)
}

it(`renders and checks a Wall of ${COUNT} ${kind} sites`, async () => {
  const sites: { file: string; label: Record<string, string>; blocks: string[] }[] = []
  for (let i = 0; i < COUNT; i++) {
    const { plan, label } = wallPlan(i)
    const r = await renderSample(kind, {
      plan,
      photoBase: 'photos/',
      content: (_, index) => chosen.get(`${i}:${index}`)?.content ?? {},
    })
    expect(r.problems).toEqual([])
    const file = `site-${String(i + 1).padStart(2, '0')}.html`
    writeFileSync(new URL(file, out), r.html)
    sites.push({
      file,
      label,
      blocks: [...plan.before, ...plan.sections, ...plan.after].map(
        (s) => `${s.type}#${s.variant} (${s.surface})`,
      ),
    })
  }
  writeFileSync(new URL('wall.json', out), JSON.stringify(sites, null, 2))

  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()
  const problems: Record<string, string[]> = {}
  for (const s of sites) {
    const found: string[] = []
    for (const width of [360, 1280]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(new URL(s.file, out).href, { waitUntil: 'networkidle' })
      await page.evaluate(() => document.fonts.ready)
      found.push(...(await page.evaluate(overflow)).map((x) => `${width}px: ${x}`))
      const axe = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
      for (const v of axe.violations)
        found.push(
          `${width}px: axe ${v.id} (${v.nodes.length}) ${v.nodes[0]?.target.join(' ') ?? ''} ${v.nodes[0]?.failureSummary?.split('\n')[1] ?? ''}`,
        )
      if (width === 1280)
        await page.screenshot({ path: new URL(s.file.replace('.html', '.png'), out).pathname })
    }
    if (found.length) problems[s.file] = found
  }
  writeFileSync(new URL('problems.json', out), JSON.stringify(problems, null, 2))

  // A contact sheet: the first screen of every site, four across.
  const tiles = sites
    .map(
      (s) =>
        `<figure><img src="${s.file.replace('.html', '.png')}"><figcaption>${s.file.slice(5, 7)} · ${Object.values(s.label).join(' · ')}</figcaption></figure>`,
    )
    .join('')
  writeFileSync(
    new URL('wall.html', out),
    `<!doctype html><style>body{margin:0;padding:12px;background:#ddd;font:12px system-ui;display:grid;grid-template-columns:repeat(4,1fr);gap:12px}figure{margin:0}img{width:100%;display:block}</style>${tiles}`,
  )
  await page.setViewportSize({ width: 1600, height: 900 })
  await page.goto(new URL('wall.html', out).href, { waitUntil: 'load' })
  await page.screenshot({ path: new URL('wall.png', out).pathname, fullPage: true })
  await browser.close()
}, 600_000)
