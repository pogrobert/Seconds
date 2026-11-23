// The variants wall: each template beside its variants (Snug, Standard, Roomy and any of its own),
// drawn by the dev server (POST /api/template, no model calls) with a sample business and its
// photos, for review before any variant is offered to an owner.
//   node src/variants-wall.ts [--only field,signal] [--kind restaurant]
// Needs `pnpm --filter @repo/web dev` on :5173 with BENCH=1. Output: runs/variants-<time>/wall.html
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import photoManifest from '../../eval/photos/manifest.json' with { type: 'json' }
import { SAMPLES } from '../../eval/src/businesses.ts'
import { contentOf } from '../../eval/src/grammar/page.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const base = 'http://localhost:5173'
const arg = (n: string) => {
  const i = process.argv.indexOf(`--${n}`)
  return i > 0 ? (process.argv[i + 1] ?? '') : ''
}
const only = arg('only').split(',').filter(Boolean)
const kind = (arg('kind') || 'restaurant') as keyof typeof SAMPLES
const manifest = photoManifest as unknown as Record<
  string,
  Record<string, { file: string; alt: string; width: number; height: number }>
>
const m = manifest[kind] ?? {}
const pic = (k: string) => {
  const x = m[k]
  return x ? { src: `${base}/photos/${x.file}`, alt: x.alt, w: x.width, h: x.height } : undefined
}
const content = {
  ...contentOf(SAMPLES[kind], m, `${base}/photos/`, { brand: '#000' }),
  photos: {
    hero: pic('hero'),
    about: pic('about'),
    cta: pic('cta'),
    d1: pic('detail-1'),
    d2: pic('detail-2'),
  },
}

const list = (await (await fetch(`${base}/api/template`)).json()) as { id: string; label: string }[]
const tpls = list.filter((t) => !only.length || only.includes(t.id))
const out = join(root, 'runs', `variants-${new Date().toISOString().replace(/[:.]/g, '-')}`)
mkdirSync(out, { recursive: true })
const VARIANTS = [
  ['snug', 'Snug'],
  ['', 'Standard'],
  ['roomy', 'Roomy'],
] as const
const rows: string[] = []
for (const t of tpls) {
  const cells: string[] = []
  for (const [v, label] of VARIANTS) {
    const res = await fetch(`${base}/api/template`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        template: t.id,
        content,
        extras: ['reasons', 'faq'],
        variant: v || undefined,
      }),
    })
    const html = await res.text()
    writeFileSync(join(out, `${t.id}${v ? `-${v}` : ''}.html`), html)
    // Inline, so the wall is one file that opens anywhere.
    const doc = html.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
    cells.push(
      `<figure><figcaption>${t.label} · ${label}</figcaption><div class="f"><iframe srcdoc="${doc}" loading="lazy"></iframe></div></figure>`,
    )
  }
  rows.push(`<section>${cells.join('')}</section>`)
}
writeFileSync(
  join(out, 'wall.html'),
  `<!doctype html><meta charset="utf-8"><title>Variants</title><style>body{margin:0;padding:24px;font:14px system-ui;background:#eee}section{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:32px}figcaption{margin-bottom:6px;color:#444}.f{position:relative;aspect-ratio:1280/2400;overflow:hidden;background:#fff;border-radius:8px}iframe{position:absolute;top:0;left:0;width:1280px;height:2400px;border:0;transform-origin:0 0;transform:scale(var(--s,.3))}</style>${rows.join('')}<script>const f=()=>{const w=document.querySelector('.f')?.clientWidth||400;document.body.style.setProperty('--s',w/1280)};f();addEventListener('resize',f)</script>`,
)
console.log(`${tpls.length} templates x ${VARIANTS.length}: ${join(out, 'wall.html')}`)
