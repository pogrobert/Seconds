// Try a prompt and a few follow-up edits the way the build page does (POST /api/build-stream,
// the site's state sent with each follow-up), and screenshot version 1 after every step for
// review (docs/m0/27-editing.md). Writes runs/try-<time>/: one sheet per prompt plus log.json.
//   PLAYWRIGHT_BROWSERS_PATH=$PWD/.browsers node src/try-edits.ts [file.json]
// file.json: [{"prompt": "…", "edits": ["…", "…"]}]. Needs the dev server on :5173.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
type Case = { prompt: string; edits: string[] }
type Site = { id: string; label: string; rules: string; html: string }
type Result = {
  name: string
  sites: Site[]
  changed?: string[]
  notes: string[]
  state: unknown
  photoJob: unknown
}
type Photos = { slots: Record<string, string>; images: Record<string, string>; notes: string[] } | null

const cases = JSON.parse(readFileSync(process.argv[2] ?? '', 'utf8')) as Case[]
const out = join(root, 'runs', `try-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}`)
mkdirSync(out, { recursive: true })

async function step(messages: string[], state: unknown) {
  const t0 = performance.now()
  const res = await fetch('http://localhost:5173/api/build-stream', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ messages, state }),
  })
  const text = await res.text()
  let result: Result | null = null
  let photos: Photos = null
  let pageMs = 0
  for (const line of text.split('\n').filter(Boolean)) {
    const e = JSON.parse(line) as { type: string; result?: Result; photos?: Photos; message?: string }
    if (e.type === 'result') {
      result = e.result ?? null
      pageMs = Math.round(performance.now() - t0)
    }
    if (e.type === 'photos') photos = e.photos ?? null
    if (e.type === 'error') throw new Error(e.message)
  }
  if (!result) throw new Error('no result')
  return { result, photos, pageMs, totalMs: Math.round(performance.now() - t0) }
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 0.5 })
const log: unknown[] = []
for (const [n, c] of cases.entries()) {
  const messages = [c.prompt]
  let state: unknown = null
  let slots: Record<string, string> = {}
  let images: Record<string, string> = {}
  const steps = [c.prompt, ...c.edits]
  for (const [i, said] of steps.entries()) {
    if (i > 0) messages.push(said)
    const r = await step(messages, state)
    state = r.result.state
    // Photos found now replace the earlier ones; an edit without new photos keeps them.
    if (r.photos) {
      slots = r.photos.slots
      images = r.photos.images
    }
    const site = r.result.sites[0] as Site
    const html = site.html.replace(/__IMG_([A-Za-z0-9]+)__/g, (t, slot: string) => {
      const id = slots[slot]
      return id ? (images[id] ?? t) : t
    })
    await page.setContent(html, { waitUntil: 'load' })
    await page.waitForTimeout(300)
    const file = `${n + 1}-${i}.jpg`
    await page.screenshot({ path: join(out, file), fullPage: true, type: 'jpeg', quality: 70 })
    const row = {
      case: n + 1,
      step: i,
      said,
      name: r.result.name,
      changed: r.result.changed ?? null,
      already: (r.result as { already?: string[] }).already ?? [],
      versions: r.result.sites.map((s) => s.label),
      notes: [...r.result.notes, ...(r.photos?.notes ?? [])],
      pageMs: r.pageMs,
      totalMs: r.totalMs,
      file,
    }
    log.push(row)
    console.log(
      `${n + 1}.${i} ${(r.pageMs / 1000).toFixed(1)}s/${(r.totalMs / 1000).toFixed(1)}s ${said.slice(0, 50)} → ${row.changed ? row.changed.join(', ') || 'nothing' : 'new site'} | ${row.name} | ${row.versions.join(', ')}${row.already.length ? ` | already: ${row.already.join('; ')}` : ''}${row.notes.length ? ` | ${row.notes.join(' ')}` : ''}`,
    )
  }
}
writeFileSync(join(out, 'log.json'), JSON.stringify(log, null, 1))
await browser.close()
console.log(out)
