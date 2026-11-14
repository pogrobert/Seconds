// The Wall preview (docs/m0/02, step 5; M1's Wall in miniature): one business, 24 sites. Each site
// draws its family (Poster, Quiet, Soft in turn), its settings (font pairing, palette, corners,
// spacing, framing), light or dark, its page rhythm and a block variant per section at random from
// what the content fits. The words are the same on every site.
// Every site is checked in Chromium at 360 and 1280 px: page wider than the window, elements
// sticking out, and axe WCAG 2.2 AA with the real fonts. Problems are listed, not hidden.
// Output: tools/eval/out/wall/<kind>/site-NN.html, wall.json (what each site chose), problems.json,
//   site-NN.png and site-NN-full.png (first screen and whole page at 1280 px),
//   wall.png (a contact sheet of the first screen of every site).
// ROUND=1 reproduces the first Wall (every hero allowed); the default round 2 uses photo-led heroes.
// Run: pnpm --filter @repo/eval wall     or    KIND=restaurant SITES=12 pnpm --filter @repo/eval wall
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import AxeBuilder from '@axe-core/playwright'
import { type BlockManifest, eligibility, manifests } from '@repo/blocks/manifest'
import { familyAxes, M0_FAMILIES } from '@repo/blocks/themes'
import {
  applyRhythm,
  DEFAULT_PLANS,
  PHOTO_HEROES,
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
/**
 * Which Wall. Round 1 drew every hero; from round 2 the hero is one of the photo-led heroes Robert
 * liked (PHOTO_HEROES), so picks judge the rest of the page. Each round has its own seeds.
 */
const ROUND = Number(process.env.ROUND ?? 3)
if (!KINDS.includes(kind)) throw new Error(`KIND must be one of ${KINDS.join(', ')}`)

const out = new URL(`../out/wall/${kind}${ROUND === 1 ? '' : `-${ROUND}`}/`, import.meta.url)
mkdirSync(out, { recursive: true })
const photos = new URL(`../photos/${kind}/`, import.meta.url)
if (existsSync(photos)) cpSync(photos, new URL(`photos/${kind}/`, out), { recursive: true })

const sample = SAMPLES[kind]
const aid = (n: number) => `a_${kind.slice(0, 4).padEnd(4, 'x')}${String(n).padStart(6, '0')}`
const img = (n: number) => ({ asset: aid(n), alt: `Inside ${sample.business.name}` })

/**
 * Round 3: what the eye sees first changes per site, not only the settings (docs/m0/05-wall-round-3.md).
 * - Brand colours that suit the kind of business. Stand-ins for the colour the owner gives or the
 *   model takes from their photos.
 * - Headline options. Stand-ins for the text model writing three or four once per business.
 * - The photo that leads: any of the business's photos that works as a banner (1 hero, 2 about,
 *   4 and 5 details; 3 is the wash basin, better lower down).
 */
const BRANDS: Record<Kind, string[]> = {
  salon: ['#5b4a7a', '#b0563a', '#5e7656', '#1f5c63', '#b4566e', '#a87a2a', '#1e2433', '#141414'],
  restaurant: ['#8a3b2e', '#2f4a3a', '#b5762a', '#1e2433', '#7a2238', '#141414'],
  clinic: ['#2a6f8f', '#3b7a6a', '#1e2433', '#6a5acd', '#2f4a3a'],
  trades: ['#d9541e', '#1e2433', '#e0b000', '#2f6a3a', '#141414'],
  fitness: ['#3b7a6a', '#c0562f', '#1e2433', '#7a5a9a', '#141414'],
}
const HEADLINES: Partial<Record<Kind, string[]>> = {
  salon: [
    'Colour that grows out beautifully',
    'Good hair, no fuss',
    'Cut, colour and calm in Leith',
    'Hair that feels like yours',
  ],
}
const LEAD_PHOTOS = [1, 2, 4, 5]

type Look = {
  brand: string
  headline: string
  /** The banner's photo, then the others in the order sections take them. */
  photos: number[]
  hero: string
}

/**
 * The stand-in content, with every picture a variant can show: a gallery, a photo, item photos.
 * A variant only uses the fields it names, so extra fields change nothing for the others.
 * From round 3, the banner takes the site's lead photo and the sections below take the rest in turn,
 * so a page repeats a photo only when it runs out.
 */
function wallContent(m: BlockManifest, variant: string, sec: SectionPlan, look?: Look) {
  const c = standInContent(sample, { ...sec, type: m.type, variant: 'rich' })
  const v = m.variants[variant]
  const uses = new Set<string>([
    ...((v?.uses ?? []) as readonly string[]),
    ...((v?.requires ?? []) as readonly string[]),
  ])
  const hero = sec.sectionType === 'hero'
  let next = 0
  const take = (fallback: number) => {
    if (!look) return fallback
    if (hero && next === 0) return look.photos[next++] as number
    const rest = look.photos.slice(1)
    const n = rest[(look.photos.length + sectionSeat(sec) + next++) % rest.length] as number
    return n
  }
  if (hero && look) c.headline = look.headline
  // A section has a photo or a gallery, never both (the spec's rule): a gallery only where the
  // variant needs one or shows no single photo.
  const requires = new Set<string>((v?.requires ?? []) as readonly string[])
  const gallery = () =>
    [take(2), take(4), take(5)].map((n, k) => ({
      id: `i_${String(950 + k).padStart(10, '0')}`,
      image: img(n),
    }))
  if (requires.has('gallery') || (uses.has('gallery') && !uses.has('media'))) {
    c.gallery = look ? gallery() : (c.gallery ?? gallery())
    delete c.media
  } else if (uses.has('media')) {
    c.media = look
      ? img(take(sec.sectionType === 'cta' ? 3 : 2))
      : (c.media ?? img(sec.sectionType === 'cta' ? 3 : 2))
    delete c.gallery
  }
  if (v && v.signature.media !== 'none' && Array.isArray(c.items))
    c.items = (c.items as Record<string, unknown>[]).map((it, i) => ({
      ...it,
      media: img(look ? take(0) : ([4, 5, 2, 3][i % 4] as number)),
    }))
  if (uses.has('form') && c.form === undefined)
    c.form = { form: 'f_newsletter', kind: 'newsletter' }
  return c
}
/** Where a section sits among the sections that take photos, so neighbours start on different ones. */
const seats = new Map<string, number>()
const sectionSeat = (sec: SectionPlan) => seats.get(sec.navLabel ?? sec.sectionType) ?? 0

type Choice = { type: string; variant: string }
const chosen = new Map<string, Choice & { content: Record<string, unknown> }>()

/** Heroes the Wall may draw from, by round. */
const heroAllowed = (id: string) =>
  ROUND === 1 ||
  (PHOTO_HEROES as readonly string[]).includes(id) ||
  (ROUND >= 3 && id.startsWith('hero/photo#'))

/**
 * Round 3's page order: the banner first, then the middle sections in a random order (one of them
 * sometimes left out), then the visit and call-to-action sections in either order.
 */
function shuffleSections(base: SectionPlan[], rand: () => number): SectionPlan[] {
  const [hero, ...rest] = base
  const end = rest.filter((x) => x.sectionType === 'hours-location' || x.sectionType === 'cta')
  let middle = rest.filter((x) => !end.includes(x))
  for (let i = middle.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[middle[i], middle[j]] = [middle[j] as SectionPlan, middle[i] as SectionPlan]
  }
  if (middle.length > 2 && rand() < 0.35) {
    // Leave out one section, but never the prices.
    const k = middle.findIndex((x) => x.sectionType !== 'price-list')
    middle = middle.filter((_, i) => i !== k)
  }
  if (rand() < 0.5) end.reverse()
  return [...(hero ? [hero] : []), ...middle, ...end]
}

/** One site of the Wall: its family, settings, mode, rhythm and variants, from a seed. */
function wallPlan(i: number): { plan: SitePlan; label: Record<string, string>; look?: Look } {
  const rand = rng(ROUND === 1 ? `${kind}-wall-${i}` : `${kind}-wall${ROUND}-${i}`)
  const pick = <T>(xs: readonly T[]): T => xs[Math.floor(rand() * xs.length)] as T
  const family = M0_FAMILIES[i % M0_FAMILIES.length] as (typeof M0_FAMILIES)[number]
  const lists = familyAxes(family)
  const axes: Record<string, string> = Object.fromEntries(
    Object.entries(lists).map(([a, vs]) => [a, pick(vs)]),
  )
  if (ROUND >= 3) {
    // Settings too small to see at a glance stay at the family's default (Robert, round 2).
    axes.corners = lists.corners[0] as string
    axes.density = lists.density[0] as string
    axes.photo = rand() < 0.5 ? 'natural' : pick(['mono', 'tint'])
  } else delete axes.photo
  const mode = rand() < 0.17 ? ('dark' as const) : ('light' as const)
  const rhythm = pick(RHYTHM_NAMES)
  const base = DEFAULT_PLANS[kind]
  let look: Look | undefined
  if (ROUND >= 3) {
    const lead = pick(LEAD_PHOTOS)
    const others = [1, 2, 3, 4, 5].filter((n) => n !== lead)
    for (let k = others.length - 1; k > 0; k--) {
      const j = Math.floor(rand() * (k + 1))
      ;[others[k], others[j]] = [others[j] as number, others[k] as number]
    }
    look = {
      brand: pick(BRANDS[kind]),
      headline: pick(HEADLINES[kind] ?? [sample.standIn.headline]),
      photos: [lead, ...others],
      hero: '',
    }
  }
  const sections = ROUND >= 3 ? shuffleSections(base.sections, rand) : base.sections
  seats.clear()
  for (const [k, x] of sections.entries()) seats.set(x.navLabel ?? x.sectionType, k)
  const redraw = (sec: SectionPlan, n: number): SectionPlan => {
    const options = manifests
      .filter((m) => m.sectionType === sec.sectionType)
      .flatMap((m) => Object.keys(m.variants).map((variant) => ({ m, variant })))
      .filter(({ m, variant }) => eligibility(m, variant, wallContent(m, variant, sec, look)).ok)
      .filter(({ m, variant }) => sec.sectionType !== 'hero' || heroAllowed(`${m.type}#${variant}`))
    const o = pick(options)
    const content = wallContent(o.m, o.variant, sec, look)
    chosen.set(`${i}:${n}`, { type: o.m.type, variant: o.variant, content })
    if (look && sec.sectionType === 'hero') look.hero = `${o.m.type}#${o.variant}`
    return { ...sec, type: o.m.type, variant: o.variant }
  }
  let n = 0
  const plan = applyRhythm(
    {
      before: base.before.map((s) => redraw(s, n++)),
      sections: sections.map((s) => redraw(s, n++)),
      after: base.after.map((s) => redraw(s, n++)),
      style: { family: `${family}@1`, axes, mode },
    },
    rhythm,
  )
  const label: Record<string, string> = { family, ...axes, mode, rhythm }
  if (look) {
    delete label.corners
    delete label.density
    Object.assign(label, { brand: look.brand, lead: `photo ${look.photos[0]}` })
  }
  return { plan, label, ...(look ? { look } : {}) }
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
  // Text that something else is painted over, such as a photo drawn on top of the words laid on it.
  for (const el of Array.from(
    document.querySelectorAll(
      '[data-slot="headline"], [data-slot^="primaryCta"], [data-slot="subhead"]',
    ),
  )) {
    el.scrollIntoView({ block: 'center' })
    const r = el.getBoundingClientRect()
    if (r.width < 2 || r.height < 2) continue
    const top = document.elementFromPoint(r.left + r.width / 2, r.top + Math.min(r.height / 2, 12))
    if (top && !el.contains(top) && !top.contains(el)) {
      const block = el.closest('[data-block-type]')
      found.push(
        `${block?.getAttribute('data-block-type')}#${block?.getAttribute('data-variant')}: ${el.getAttribute('data-slot')} is covered by <${top.tagName.toLowerCase()}>`,
      )
    }
  }
  window.scrollTo(0, 0)
  return [...new Set(found)].slice(0, 8)
}

it(`renders and checks a Wall of ${COUNT} ${kind} sites`, async () => {
  const sites: {
    file: string
    label: Record<string, string>
    headline?: string
    blocks: string[]
  }[] = []
  for (let i = 0; i < COUNT; i++) {
    const { plan, label, look } = wallPlan(i)
    const r = await renderSample(kind, {
      plan,
      ...(look ? { brand: look.brand } : {}),
      photoBase: 'photos/',
      content: (_, index) => chosen.get(`${i}:${index}`)?.content ?? {},
    })
    expect(r.problems).toEqual([])
    const file = `site-${String(i + 1).padStart(2, '0')}.html`
    writeFileSync(new URL(file, out), r.html)
    sites.push({
      file,
      label,
      ...(look ? { headline: look.headline } : {}),
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
      if (width === 1280) {
        await page.screenshot({ path: new URL(s.file.replace('.html', '.png'), out).pathname })
        await page.screenshot({
          path: new URL(s.file.replace('.html', '-full.png'), out).pathname,
          fullPage: true,
        })
      }
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
