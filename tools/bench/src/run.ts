// The benchmark runner (docs/m0/18-bench.md). Builds every brief through the running build page's
// /api/build (the real runtime, real models, real photos), saves each version as a page that
// opens on its own, screenshots it on desktop and phone, and runs the checks code can judge.
//
//   pnpm --filter @repo/bench bench --label photo-fix [--only dentist,plumber] [--base http://localhost:5173]
//
// Writes runs/<date>-<label>/: meta.json, summary.json, report.html, and per brief its result,
// pages and screenshots. Open the report with `pnpm --filter @repo/bench serve`.

import { execSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { BRIEFS, type Brief } from './briefs.ts'
import { factProblems, pageChecks } from './checks.ts'
import { EDGE } from './edge.ts'
import { reportHtml } from './report.ts'
import { WIDE } from './wide.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const arg = (name: string, fallback = '') => {
  const i = process.argv.indexOf(`--${name}`)
  return i > 0 ? (process.argv[i + 1] ?? fallback) : fallback
}
const label = arg('label', 'run').replace(/[^\w-]+/g, '-')
const base = arg('base', 'http://localhost:5173')
const only = arg('only').split(',').filter(Boolean)
// One at a time: Pixabay allows 100 searches a minute and a build can make up to nine; two at a
// time hit the limit in 14 of 30 builds (baseline run, 2026-11-17).
const concurrency = Number(arg('concurrency', '1'))
// Sets: core (rated blind), wide (checks only; a rotating sample, since every build fetches stock
// photos and Pixabay asks to be told before bulk use), edge (built to break things).
const set = arg('set', 'core')
const SETS: Record<string, Brief[]> = { core: BRIEFS, wide: WIDE, edge: EDGE }
const pool = SETS[set]
if (!pool) throw new Error(`--set must be one of ${Object.keys(SETS).join(', ')}`)
// The wide set is sampled by default: 40 briefs, a different 40 each day unless --seed is given.
const sample = Number(arg('sample', set === 'wide' ? '40' : '0'))
const seed = arg('seed', new Date().toISOString().slice(0, 10))
function sampled(xs: Brief[], n: number, key: string): Brief[] {
  const score = (id: string) => {
    let h = 2166136261
    for (const ch of `${key}:${id}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
    return h >>> 0
  }
  return [...xs].sort((a, b) => score(a.id) - score(b.id)).slice(0, n)
}
const briefs = only.length
  ? [...BRIEFS, ...WIDE, ...EDGE].filter((b) => only.includes(b.id))
  : sample > 0
    ? sampled(pool, sample, seed)
    : pool

type Site = { id: string; label: string; rules: string; html: string }
export type BuildResult = {
  name: string
  kindLabel: string
  sites: Site[]
  images: Record<string, string>
  credits: { photographer: string; page: string }[]
  photoSearches: string[]
  ms: { decide: number; text: number; photos: number; render: number; total: number }
  costUsd: number
  notes: string[]
}
export type SiteRecord = {
  id: string
  rules: string
  blocks: string[]
  photos: string[]
  problems: { desktop: string[]; phone: string[] }
}
export type BriefRecord = {
  brief: Brief
  ok: boolean
  error?: string
  wallMs: number
  name?: string
  kind?: string
  ms?: BuildResult['ms']
  costUsd?: number
  notes?: string[]
  photoSearches?: string[]
  facts: string[]
  sites: SiteRecord[]
}

const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')
const runId = `${stamp}-${only.length ? 'only' : set}-${label}`
const dir = join(root, 'runs', runId)
mkdirSync(dir, { recursive: true })
const git = (cmd: string) => {
  try {
    return execSync(`git ${cmd}`, { cwd: root }).toString().trim()
  } catch {
    return ''
  }
}
const meta = {
  runId,
  label,
  set: only.length ? 'only' : set,
  sample: only.length ? 0 : sample,
  seed: sample > 0 ? seed : '',
  date: new Date().toISOString(),
  commit: git('rev-parse --short HEAD'),
  uncommitted: git('status --porcelain').split('\n').filter(Boolean).length,
  base,
  briefs: briefs.map((b) => b.id),
}
writeFileSync(join(dir, 'meta.json'), JSON.stringify(meta, null, 2))
console.log(`run ${runId}: ${briefs.length} briefs against ${base}`)

const browser = await chromium.launch()
const records: BriefRecord[] = []

async function one(brief: Brief): Promise<BriefRecord> {
  const t0 = performance.now()
  const out = join(dir, brief.id)
  mkdirSync(out, { recursive: true })
  let r: BuildResult
  try {
    const res = await fetch(`${base}/api/build`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages: [brief.words] }),
      signal: AbortSignal.timeout(120_000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)
    r = (await res.json()) as BuildResult
  } catch (e) {
    return {
      brief,
      ok: false,
      error: e instanceof Error ? e.message : String(e),
      wallMs: Math.round(performance.now() - t0),
      facts: [],
      sites: [],
    }
  }
  const wallMs = Math.round(performance.now() - t0)
  const sites: SiteRecord[] = []
  let text = ''
  for (const s of r.sites) {
    // A page that opens on its own: the photo tokens become the photos themselves.
    const html = s.html.replace(/__IMG_([A-Za-z0-9]+)__/g, (t, id: string) => r.images[id] ?? t)
    writeFileSync(join(out, `${s.id}.html`), html)
    const problems = { desktop: [] as string[], phone: [] as string[] }
    for (const [view, size] of [
      ['desktop', { width: 1280, height: 800 }],
      ['phone', { width: 390, height: 844 }],
    ] as const) {
      const page = await browser.newPage({ viewport: size })
      await page.setContent(html, { waitUntil: 'load', timeout: 30_000 }).catch(() => {})
      await page.evaluate(() => document.fonts.ready).catch(() => {})
      problems[view] = await page.evaluate(pageChecks).catch((e) => [`checks failed: ${e}`])
      if (view === 'desktop') text = await page.evaluate(() => document.body.innerText)
      await page.screenshot({ path: join(out, `${s.id}-${view}.jpg`), type: 'jpeg', quality: 70 })
      if (view === 'desktop')
        await page.screenshot({
          path: join(out, `${s.id}-full.jpg`),
          type: 'jpeg',
          quality: 45,
          fullPage: true,
        })
      await page.close()
    }
    const blocks = s.rules.split(' · ').filter((x) => x.includes('/'))
    const photos = [
      ...new Set([...s.html.matchAll(/__IMG_([A-Za-z0-9]+)__/g)].map((m) => m[1] ?? '')),
    ]
    sites.push({ id: s.id, rules: s.rules, blocks, photos, problems })
  }
  const { images: _drop, sites: _pages, ...kept } = r
  writeFileSync(join(out, 'result.json'), JSON.stringify(kept, null, 2))
  return {
    brief,
    ok: true,
    wallMs,
    name: r.name,
    kind: r.kindLabel,
    ms: r.ms,
    costUsd: r.costUsd,
    notes: r.notes,
    photoSearches: r.photoSearches,
    facts: factProblems(brief.words, text),
    sites,
  }
}

const queue = [...briefs]
await Promise.all(
  Array.from({ length: concurrency }, async () => {
    for (let b = queue.shift(); b; b = queue.shift()) {
      let rec = await one(b)
      // Pixabay's limit is about the harness, not the build: wait it out and build once more.
      if (rec.notes?.some((n) => n.includes('limits searches'))) {
        console.log(
          `    ${b.id}: Pixabay limit reached, waiting 60 s and building again. ${rec.notes?.find((n) => n.includes('limits searches'))?.match(/\((.*)\)/)?.[1] ?? ''}`,
        )
        await new Promise((r) => setTimeout(r, 60_000))
        rec = await one(b)
      }
      records.push(rec)
      const p = rec.sites.reduce(
        (n, s) => n + s.problems.desktop.length + s.problems.phone.length,
        0,
      )
      console.log(
        `${rec.ok ? 'ok ' : 'ERR'} ${b.id.padEnd(18)} ${String(rec.ms?.total ?? rec.wallMs).padStart(6)} ms  ${(rec.costUsd ?? 0).toFixed(4)} USD  ${p} page problems  ${rec.facts.length} fact flags${rec.error ? `  ${rec.error}` : ''}`,
      )
    }
  }),
)
await browser.close()

records.sort((a, b) => briefs.indexOf(a.brief) - briefs.indexOf(b.brief))
// The same photo for different kinds of business means it was not chosen for this one.
const usedBy = new Map<string, Set<string>>()
for (const r of records)
  for (const s of r.sites)
    for (const p of s.photos) usedBy.set(p, (usedBy.get(p) ?? new Set()).add(r.brief.id))
// Only across different kinds (a brief's first tag): two cafés may share a café photo.
const kindOf = new Map(briefs.map((b) => [b.id, b.tags[0]]))
const shared = [...usedBy]
  .filter(([, ids]) => new Set([...ids].map((id) => kindOf.get(id))).size > 1)
  .map(([p, ids]) => ({ photo: p, briefs: [...ids] }))

const ok = records.filter((r) => r.ok)
const totals = (f: (r: BriefRecord) => number) => ok.map(f).sort((a, b) => a - b)
const pct = (xs: number[], q: number) => xs[Math.min(xs.length - 1, Math.floor(q * xs.length))] ?? 0
const ms = totals((r) => r.ms?.total ?? 0)
const summary = {
  ...meta,
  built: ok.length,
  failed: records.length - ok.length,
  msMedian: pct(ms, 0.5),
  msP90: pct(ms, 0.9),
  photosMsMedian: pct(
    totals((r) => r.ms?.photos ?? 0),
    0.5,
  ),
  costUsdTotal: ok.reduce((s, r) => s + (r.costUsd ?? 0), 0),
  costUsdPerSite: ok.length ? ok.reduce((s, r) => s + (r.costUsd ?? 0), 0) / ok.length : 0,
  pageProblems: ok.reduce(
    (n, r) =>
      n + r.sites.reduce((m, s) => m + s.problems.desktop.length + s.problems.phone.length, 0),
    0,
  ),
  factFlags: ok.reduce((n, r) => n + r.facts.length, 0),
  noPhotoSites: ok.filter((r) => r.sites.every((s) => s.photos.length === 0)).length,
  sharedPhotos: shared.length,
  notes: ok.reduce((n, r) => n + (r.notes?.length ?? 0), 0),
}
writeFileSync(join(dir, 'summary.json'), JSON.stringify({ summary, shared, records }, null, 2))
writeFileSync(join(dir, 'report.html'), reportHtml(summary, records, shared))
console.log('\n', summary)
console.log(`\nreport: runs/${runId}/report.html (pnpm --filter @repo/bench serve)`)
