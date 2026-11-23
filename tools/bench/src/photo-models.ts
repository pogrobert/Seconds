// The photo look (apps/web/src/server/photos.ts) with other vision models, on the same searches:
// what each keeps per space, how long it takes and what it costs. For choosing a backup model.
//   node --env-file=../../apps/web/.dev.vars src/photo-models.ts model1,model2,…
import { mkdirSync, writeFileSync } from 'node:fs'
import { findPhotos } from '../../../apps/web/src/server/photos.ts'

const models = (process.argv[2] ?? 'google/gemini-2.5-flash-lite').split(',')
const SUBJECTS = ['place', 'people', 'detail'] as const
const CASES = [
  {
    about: { name: 'Rapid Pipe', kind: 'plumber', town: 'Leeds' },
    q: { place: 'plumbing van', people: 'plumber fixing pipe', detail: 'copper pipe fittings' },
  },
  {
    about: { name: 'Little Waves', kind: 'swim school', town: 'Austin' },
    q: { place: 'indoor swimming pool', people: 'swimming lesson', detail: 'pool lane rope' },
  },
  {
    about: { name: 'Kvevri', kind: 'Georgian restaurant', town: 'Tbilisi' },
    q: { place: 'restaurant interior', people: 'chef cooking', detail: 'khinkali dumplings' },
  },
  {
    about: { name: 'Spoke & Chain', kind: 'bike repair shop', town: 'Utrecht' },
    q: { place: 'bike workshop', people: 'mechanic repairing bicycle', detail: 'bicycle chain' },
  },
  {
    about: { name: 'Bath Blooms', kind: 'wedding florist', town: 'Bath' },
    q: { place: 'flower shop', people: 'florist arranging flowers', detail: 'wedding bouquet' },
  },
  {
    about: { name: 'Bits Club', kind: "kids' coding club", town: 'Bristol' },
    q: { place: 'classroom computers', people: 'children coding', detail: 'laptop keyboard' },
  },
]
const rows: string[] = []
const picks: { name: string; model: string; s: string; src: string }[] = []
const keys = { pixabay: process.env.PIXABAY_API_KEY, openrouter: process.env.OPENROUTER_API_KEY }
for (const c of CASES) {
  console.log(`\n${c.about.name} (${c.about.kind})`)
  let base: string[] = []
  for (const [m, model] of models.entries()) {
    const f = await findPhotos(keys, c.q, c.about, { model })
    const ids = SUBJECTS.map((s) => f.natural[s].map((p) => p.id))
    if (m === 0) base = ids.flat()
    const same = ids.flat().filter((id) => base.includes(id)).length
    console.log(
      `  ${model.padEnd(42)} ${String(f.ms).padStart(5)} ms $${f.costUsd.toFixed(4)} judged:${f.judged} kept ${ids.map((x) => x.length).join('/')} same-as-first ${same}/${ids.flat().length}`,
    )
    rows.push(
      `<tr><th>${c.about.name}<br><small>${model}</small></th>${SUBJECTS.map((s) => `<td>${f.natural[s].map((p) => `<img src="${p.source}">`).join('') || '—'}</td>`).join('')}</tr>`,
    )
    for (const s of SUBJECTS)
      for (const p of f.natural[s]) picks.push({ name: c.about.name, model, s, src: p.source })
    for (const s of SUBJECTS)
      console.log(
        `      ${s}: ${f.natural[s].map((p) => p.alt).join(' | ') || '(none)'}`.slice(0, 200),
      )
  }
}
mkdirSync(new URL('../runs/', import.meta.url), { recursive: true })
const out = new URL(`../runs/photo-models-${Date.now()}.html`, import.meta.url)
writeFileSync(
  out,
  `<!doctype html><meta charset="utf-8"><style>body{font:13px system-ui}td,th{border-bottom:1px solid #ddd;padding:6px;vertical-align:top;text-align:left}img{height:110px;margin-right:4px}</style><table><tr><th></th><th>place</th><th>people</th><th>detail</th></tr>${rows.join('')}</table>`,
)
writeFileSync(new URL(`${out.pathname}.json`, 'file://'), JSON.stringify(picks))
console.log(out.pathname)
