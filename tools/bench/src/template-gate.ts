// The template quality gate and review wall (docs/m0/25-template-plan.md). Every template is
// drawn by the dev server (POST /api/template, no model calls) with test content in many cases,
// and each page must pass the bench's page checks at desktop and phone width. Then the wall:
// every template filled with the same sample businesses, side by side, for review.
//   PLAYWRIGHT_BROWSERS_PATH=$PWD/.browsers node src/template-gate.ts [--only a,b] [--no-wall]
// Needs `pnpm --filter @repo/web dev` running on :5173. Output: runs/gate-<time>/ (wall.html).

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { full, minimal, rtl } from '../../../packages/library/test/fixtures.ts'
import photoManifest from '../../eval/photos/manifest.json' with { type: 'json' }
import { SAMPLES } from '../../eval/src/businesses.ts'
import { contentOf } from '../../eval/src/grammar/page.ts'
import { pageChecks } from './checks.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const base = 'http://localhost:5173'
const arg = (n: string) => {
  const i = process.argv.indexOf(`--${n}`)
  return i > 0 ? (process.argv[i + 1] ?? '') : ''
}
const only = arg('only').split(',').filter(Boolean)
const wall = !process.argv.includes('--no-wall')

type Content = typeof full
type Photo = Content['photos']['hero']
const manifest = photoManifest as unknown as Record<
  string,
  Record<string, { file: string; alt: string; width: number; height: number }>
>
/** A sample business's own photos, served by the dev server from public/photos/. */
const photosOf = (kind: string): Content['photos'] => {
  const m = manifest[kind] ?? {}
  const p = (k: string): Photo => {
    const x = m[k]
    return x ? { src: `${base}/photos/${x.file}`, alt: x.alt, w: x.width, h: x.height } : art(k)
  }
  return { hero: p('hero'), about: p('about'), cta: p('cta'), d1: p('detail-1'), d2: p('detail-2') }
}
/** Stands in for drawn art: what a space gets when no photo fitted (the templates hide some). */
const art = (alt: string): Photo => ({
  src: `data:image/svg+xml;base64,${Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#9aa8a0"/><stop offset="1" stop-color="#d9d4c7"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><circle cx="760" cy="420" r="260" fill="#6f7d74" opacity=".5"/></svg>',
  ).toString('base64')}`,
  alt,
  w: 1200,
  h: 800,
})
const noPhotos: Content['photos'] = {
  hero: art('hero'),
  about: art('about'),
  cta: art('cta'),
  d1: art('d1'),
  d2: art('d2'),
}
const ALL = ['statement', 'reasons', 'audience', 'steps', 'gallery', 'faq']

// The gate's cases: long, minimal and right-to-left content; with photos, without, and mixed.
const CASES: { id: string; content: Content; extras: string[] }[] = [
  { id: 'long+photos', content: { ...full, photos: photosOf('restaurant') }, extras: ALL },
  { id: 'minimal+none', content: { ...minimal, photos: noPhotos }, extras: [] },
  {
    id: 'rtl+mixed',
    content: { ...rtl, photos: { ...photosOf('clinic'), d1: art('d1'), cta: art('cta') } },
    extras: ['faq', 'steps'],
  },
  {
    id: 'long+none',
    content: { ...full, photos: noPhotos },
    extras: ['statement', 'gallery', 'faq'],
  },
]
const BRANDS = { forest: '#1f4d3a', charcoal: '#2b2b2b', coral: '#e0725c' }

// The wall: the sample businesses as an owner would see them.
const sample = (kind: keyof typeof SAMPLES, photos = true) => {
  const c = contentOf(SAMPLES[kind], manifest[kind] ?? {}, `${base}/photos/`, { brand: '#000' })
  return { ...c, photos: photos ? photosOf(kind) : noPhotos } as unknown as Content
}
// The trades sample lists no services; an electrician's usual ones, as the writer would give.
const withOffer = (c: Content): Content =>
  c.prices.some((g) => g.items.length)
    ? c
    : {
        ...c,
        prices: [
          {
            group: '',
            items: [
              {
                name: 'Rewiring',
                detail: 'Whole houses or single rooms, tested when finished.',
                price: '',
              },
              { name: 'Fuse boards', detail: 'Old boards replaced with modern ones.', price: '' },
              {
                name: 'Lighting',
                detail: 'New lights inside and out, fitted and tidied.',
                price: '',
              },
              {
                name: 'Fault finding',
                detail: 'Tripping switches and dead sockets traced and fixed.',
                price: '',
              },
            ],
          },
        ],
      }
// The samples carry no questions or steps; a dentist's usual ones, so templates built around
// them (Answers, Numbered, Story) show their idea on the wall.
const withQuestions = (c: Content): Content => ({
  ...c,
  faq: [
    {
      q: 'Are you taking new patients?',
      a: 'Yes. Call or book online and we will find you a first appointment.',
    },
    {
      q: 'Do you see children?',
      a: 'Yes, from their first tooth. Children come with a parent or carer.',
    },
    {
      q: 'What if I am in pain?',
      a: 'Call us first thing. We keep emergency slots every weekday morning.',
    },
  ],
  steps: {
    title: 'Your first visit',
    items: [
      { title: 'Book', body: 'Call or book online and tell us if anything hurts.' },
      { title: 'Check-up', body: 'A full examination and X-rays if you need them.' },
      { title: 'Plan', body: 'We explain every option and its cost before we start.' },
    ],
  },
})
const WALL = [
  {
    id: 'restaurant',
    content: sample('restaurant'),
    brand: '#8f1d36',
    type: 'heritage',
    extras: ['statement', 'faq'],
  },
  {
    id: 'clinic',
    content: withQuestions(sample('clinic')),
    brand: '#1f6f78',
    type: 'friendly',
    extras: ['steps', 'faq'],
  },
  {
    id: 'trades, no photos',
    content: withOffer(sample('trades', false)),
    brand: '#1e2f55',
    type: 'grotesk',
    extras: ['steps', 'audience'],
  },
  {
    id: 'salon',
    content: sample('salon'),
    brand: '#b85d72',
    type: 'couture',
    extras: ['reasons', 'gallery'],
  },
]

async function draw(
  template: string,
  content: Content,
  brand: string,
  type: string,
  extras: string[],
) {
  const res = await fetch(`${base}/api/template`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ template, content, brand, type, extras }),
  })
  if (!res.ok) throw new Error(`${template}: HTTP ${res.status} ${await res.text()}`)
  return res.text()
}

const templates = (
  (await (await fetch(`${base}/api/template`)).json()) as { id: string; label: string }[]
).filter((t) => !only.length || only.includes(t.id))
const out = join(
  root,
  'runs',
  `gate-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}`,
)
mkdirSync(out, { recursive: true })
const browser = await chromium.launch()
const report: Record<string, string[]> = {}
for (const t of templates) {
  const problems: string[] = []
  for (const k of CASES)
    for (const [bn, brand] of Object.entries(BRANDS)) {
      const html = await draw(t.id, k.content, brand, 'grotesk', k.extras)
      for (const width of [1280, 390]) {
        const page = await browser.newPage({ viewport: { width, height: 900 } })
        await page.setContent(html, { waitUntil: 'load' })
        const found = await page.evaluate(pageChecks)
        for (const f of found) problems.push(`${k.id} · ${bn} · ${width}px: ${f}`)
        await page.close()
      }
    }
  report[t.id] = [...new Set(problems)]
  console.log(`${t.id}: ${report[t.id]?.length ? `${report[t.id]?.length} problems` : 'passes'}`)
  for (const p of report[t.id]?.slice(0, 8) ?? []) console.log(`  ${p}`)
}
writeFileSync(join(out, 'gate.json'), JSON.stringify(report, null, 1))

if (wall) {
  const rows: string[] = []
  for (const t of templates) {
    const cells: string[] = []
    for (const w of WALL) {
      const html = await draw(t.id, w.content, w.brand, w.type, w.extras)
      const file = `${t.id}--${w.id.replace(/\W+/g, '-')}.jpg`
      const page = await browser.newPage({
        viewport: { width: 1280, height: 860 },
        deviceScaleFactor: 0.5,
      })
      await page.setContent(html, { waitUntil: 'load' })
      await page.evaluate(async () => {
        for (const img of Array.from(document.images)) img.loading = 'eager'
        await Promise.all(Array.from(document.images).map((i) => i.decode().catch(() => {})))
      })
      await page.screenshot({ path: join(out, file), fullPage: true, type: 'jpeg', quality: 72 })
      await page.close()
      cells.push(
        `<figure><figcaption>${w.id}</figcaption><a href="${file}"><img src="${file}" loading="lazy"></a></figure>`,
      )
    }
    const n = report[t.id]?.length ?? 0
    rows.push(
      `<section><h2>${t.label} <small class="${n ? 'bad' : 'ok'}">${n ? `${n} problems` : 'passes the gate'}</small></h2><div class="row">${cells.join('')}</div></section>`,
    )
  }
  writeFileSync(
    join(out, 'wall.html'),
    `<!doctype html><meta charset="utf-8"><title>Template wall</title><style>body{margin:0;padding:24px;font:14px/1.4 system-ui;background:#eee;color:#111}h2{font-size:18px;margin:32px 0 10px}small{font-weight:400;font-size:13px;margin-left:8px}.ok{color:#1d7a46}.bad{color:#b3261e}.row{display:grid;grid-template-columns:repeat(${WALL.length},minmax(0,1fr));gap:12px;align-items:start}figure{margin:0;background:#fff;border-radius:6px;overflow:hidden}figcaption{padding:6px 10px;color:#666}img{display:block;width:100%;max-height:1400px;object-fit:cover;object-position:top}</style><h1>Templates on the same businesses</h1><p>Each row is one template; click a page for full size.</p>${rows.join('')}`,
  )
  console.log(
    `wall: ${join(out, 'wall.html').replace(`${root}/`, '')} (http://127.0.0.1:8791/${join(out, 'wall.html').replace(`${root}/`, '')})`,
  )
}
await browser.close()
