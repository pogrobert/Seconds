import { manifests } from '@repo/blocks/manifest'
import { describe, expect, it } from 'vitest'
import {
  type Answer,
  type Brief,
  type Copy,
  checkCopy,
  compileQuestions,
  DEFAULT_PLANS,
  defaultSite,
  fixedText,
  generateSite,
  KINDS,
  PHOTO_HEROES,
  randomDecisions,
  resolveSite,
  type SectionPlan,
  slotOf,
  typesafeDecisions,
} from '../src/index.ts'

const brief: Brief = {
  id: 'salon-01',
  kind: 'salon',
  name: 'Northside Hair',
  place: 'Leith, Edinburgh',
  words: 'A calm, upmarket colour studio. Unhurried appointments, honest advice.',
  color: '#5b4a7a',
}
const photos = [
  { n: 1, shows: 'the salon interior' },
  { n: 2, shows: 'a stylist cutting hair' },
]
const copy: Copy = {
  tagline: 'Hair salon in Leith',
  headline: 'Good hair, no fuss',
  subhead: 'Lived-in colour and precise cuts from a small team that listens first.',
  about: 'We opened with two chairs and one promise: no rushing.',
  visit: 'Five minutes from the Shore; paid parking nearby.',
  reasons: [
    { title: 'Unhurried', body: 'Every colour starts with a consultation.' },
    { title: 'Kind products', body: 'Vegan colour and refills.' },
    { title: 'Honest advice', body: 'We tell you what will suit you.' },
  ],
  cta: { headline: 'Ready for a change?', subhead: 'Book a free consultation.', label: 'Book now' },
}
const isPhotoHero = (id: string) =>
  (PHOTO_HEROES as readonly string[]).includes(id) || id.startsWith('hero/photo#')

describe('question compiler', () => {
  for (const kind of KINDS)
    it(`${kind}: unique ids, at least two options each, a fixed small count`, () => {
      const qs = compileQuestions(kind, photos, manifests)
      const ids = qs.map((c) => c.question.id)
      expect(new Set(ids).size).toBe(ids.length)
      for (const c of qs)
        if (c.question.kind === 'choice') expect(c.question.options.length).toBeGreaterThan(1)
      // The count must not grow with the library: it depends on sections and attributes only.
      expect(qs.length).toBeLessThan(80)
      // A business with photos never gets a text-only banner offered.
      const heroMedia = qs.find((c) => c.question.id === 'section.hero.media')
      if (heroMedia?.question.kind === 'choice')
        expect(heroMedia.question.options.map((o) => o.key)).not.toContain('none')
    })
})

describe('resolve', () => {
  it('random answers give a valid photo-led plan, in every kind', async () => {
    for (const kind of KINDS)
      for (let s = 0; s < 10; s++) {
        const qs = compileQuestions(kind, photos, manifests)
        const { answers } = await randomDecisions(`${kind}-${s}`).decide(
          {},
          qs.map((c) => c.question),
        )
        const { plan, look } = resolveSite(kind, qs, answers, manifests, () => true)
        const hero = plan.sections[0]
        expect(hero && isPhotoHero(`${hero.type}#${hero.variant}`)).toBe(true)
        // At least one optional section always stays.
        expect(plan.sections.length).toBeGreaterThanOrEqual(
          DEFAULT_PLANS[kind].sections.filter(
            (x) => !['cards', 'text-media'].includes(x.sectionType),
          ).length + 1,
        )
        expect([1, 2]).toContain(look.leadPhoto)
        for (const sec of [...plan.before, ...plan.sections, ...plan.after])
          expect(manifests.find((m) => m.type === sec.type)?.variants[sec.variant]).toBeDefined()
      }
  })
  it('follows clear answers: family, dark mode, section first, section dropped', () => {
    const qs = compileQuestions('salon', photos, manifests)
    const answers = new Map<string, Answer>()
    const set = (id: string, top: string) =>
      answers.set(id, { kind: 'choice', id, top, dist: { [top]: 1 }, pTop: 1, margin: 1 })
    set('style.family', 'poster')
    set('style.poster.type', 'anton')
    set('style.mode', 'dark')
    const middle = DEFAULT_PLANS.salon.sections.slice(1)
    const prices = middle.find((s) => s.sectionType === 'price-list') as SectionPlan
    set('page.first', slotOf(prices))
    const about = middle.find((s) => s.sectionType === 'text-media') as SectionPlan
    answers.set(`keep.${slotOf(about)}`, { kind: 'bool', id: `keep.${slotOf(about)}`, pTrue: 0.1 })
    const { plan, decided } = resolveSite('salon', qs, answers, manifests, () => true)
    expect(plan.style.family).toBe('poster@1')
    expect(plan.style.axes.type).toBe('anton')
    expect(plan.style.mode).toBe('dark')
    expect(plan.sections[1]?.sectionType).toBe('price-list')
    expect(plan.sections.some((s) => s.sectionType === 'text-media')).toBe(false)
    // Questions nobody answered take the default and say so.
    expect(decided.find((d) => d.binding.to === 'frame')?.source).toBe('default')
  })
  it('never picks a variant that cannot hold the content', async () => {
    const qs = compileQuestions('salon', photos, manifests)
    const { answers } = await randomDecisions('x').decide(
      {},
      qs.map((c) => c.question),
    )
    const { plan } = resolveSite('salon', qs, answers, manifests, (s) => s.type !== 'hero/photo')
    expect(plan.sections[0]?.type).not.toBe('hero/photo')
  })
  it('arm B is the code default', () => {
    expect(defaultSite('clinic').plan).toBe(DEFAULT_PLANS.clinic)
  })
})

describe('TypeSafe adapter', () => {
  it('sends one pinned request and maps wire names back to library keys', async () => {
    let sent: { url: string; init: RequestInit } | null = null
    const fake = (async (url: string, init: RequestInit) => {
      sent = { url, init }
      const req = JSON.parse(String(init.body)) as {
        questions: Record<string, { type: string; criteria?: Record<string, string> }>
      }
      const answers = Object.fromEntries(
        Object.entries(req.questions).map(([name, q]) => {
          if (q.type === 'noul') return [name, { type: 'noul', noul: 0.8 }]
          const keys = Object.keys(q.criteria ?? {})
          const probabilities = Object.fromEntries(
            keys.map((k, i) => [k, i === 1 ? 0.7 : 0.3 / (keys.length - 1)]),
          )
          return [name, { type: 'choice', choice: keys[1], confidence: 0.5, probabilities }]
        }),
      )
      return new Response(
        JSON.stringify({
          model: 'jev-1.14.0',
          answers,
          usage: { input_tokens: 1000, output_tokens: 10 },
        }),
      )
    }) as unknown as typeof fetch
    const port = typesafeDecisions({ apiKey: 'test-key', fetch: fake })
    const qs = compileQuestions('salon', photos, manifests)
    const res = await port.decide(
      { brief: 'x' },
      qs.map((c) => c.question),
    )
    expect(sent).not.toBeNull()
    const { url, init } = sent as unknown as { url: string; init: RequestInit }
    expect(url).toBe('https://api.typesafe.ai/v1/systemone')
    expect(JSON.parse(String(init.body)).model).toBe('jev-1.14.0')
    expect((init.headers as Record<string, string>).authorization).toBe('Bearer test-key')
    // Question ids never reach the model.
    expect(String(init.body)).not.toContain('style.family')
    const fam = res.answers.get('style.family')
    expect(fam?.kind === 'choice' && fam.top).toBe('quiet') // the second option
    expect(fam?.kind === 'choice' && fam.pTop).toBeCloseTo(0.7)
    expect(res.calls[0]?.costUsd).toBeCloseTo(0.000042)
  })
  it('turns a failed call into missing answers and retries once', async () => {
    let n = 0
    const fake = (async () => {
      n++
      return new Response('{}', { status: 503 })
    }) as unknown as typeof fetch
    const res = await typesafeDecisions({ apiKey: 'k', fetch: fake }).decide({}, [
      { kind: 'bool', id: 'a', prompt: 'p' },
    ])
    expect(n).toBe(2)
    expect(res.answers.get('a')?.kind).toBe('missing')
  })
})

describe('generate()', () => {
  it('produces a site and a record with stand-ins', async () => {
    const site = await generateSite(
      { brief, photos, facts: 'Hair salon.' },
      {
        decide: randomDecisions('g'),
        text: fixedText(() => copy),
        manifests,
        eligible: () => () => true,
      },
    )
    expect(site.copy.headline).toBe(copy.headline)
    expect(site.record.decision.adapter).toBe('random')
    expect(site.record.questions.length).toBeGreaterThan(10)
    expect(site.record.decided.length).toBeGreaterThan(10)
  })
  it('checks the words against their limits', () => {
    expect(checkCopy(copy, false)).toEqual([])
    expect(checkCopy({ ...copy, headline: 'x'.repeat(41) }, false)).toHaveLength(1)
    expect(checkCopy(copy, true)).toContain('steps must have 3 items')
  })
})
