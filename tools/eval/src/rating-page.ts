// Builds the blind rating page for an M0 run (docs/technical/README.md, Build order, step 5).
// Robert sees two sites for one brief and picks the one he would rather give that owner. He never
// sees which arm made which site:
// - site files get random names, so a name cannot give an arm away;
// - pairs come in a shuffled order, with each brief's two pairs in different halves of the list;
// - the key (pair → which side is which arm) is written next to the run, never into the page.
// Choices are saved in the page's own storage (the artifact's db, readable by its owner only), and
// in the browser as a fallback.
// Run: node tools/eval/src/rating-page.ts [run]     (default run: live)
import { copyFileSync, cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { rng } from '@repo/pipeline'
import { BRIEFS } from './briefs.ts'

const RUN = process.argv[2] ?? 'live'
const runDir = new URL(`../out/m0/${RUN}/`, import.meta.url)
const outDir = new URL('rating/', runDir)
rmSync(outDir, { recursive: true, force: true })
mkdirSync(new URL('sites/', outDir), { recursive: true })
cpSync(new URL('photos/', runDir), new URL('photos/', outDir), { recursive: true })

type KeyPair = { id: string; brief: string; left: string; right: string }
const pairs = JSON.parse(readFileSync(new URL('pairs-key.json', runDir), 'utf8')) as KeyPair[]
const rand = rng(`rating-${RUN}`)
const token = () => Array.from({ length: 10 }, () => Math.floor(rand() * 36).toString(36)).join('')
const shuffle = <T>(xs: T[]): T[] => {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j] as T, a[i] as T]
  }
  return a
}

// One random file name per site.
const fileOf = new Map<string, string>()
const siteFile = (brief: string, arm: string) => {
  const k = `${brief}-${arm}`
  let f = fileOf.get(k)
  if (!f) {
    f = `s-${token()}.html`
    fileOf.set(k, f)
    copyFileSync(new URL(`sites/${k}.html`, runDir), new URL(`sites/${f}`, outDir))
  }
  return f
}

// Each brief's two pairs land in different halves; each half is shuffled.
const byBrief = new Map<string, KeyPair[]>()
for (const p of pairs) byBrief.set(p.brief, [...(byBrief.get(p.brief) ?? []), p])
const first: KeyPair[] = []
const second: KeyPair[] = []
for (const ps of byBrief.values()) {
  const [x, y] = shuffle(ps)
  if (x) first.push(x)
  if (y) second.push(y)
}
const ordered = [...shuffle(first), ...shuffle(second)]

const shown = ordered.map((p, i) => {
  const brief = BRIEFS.find((b) => b.id === p.brief)
  return {
    n: i + 1,
    id: `p${String(i + 1).padStart(2, '0')}-${token().slice(0, 4)}`,
    name: brief?.name ?? '',
    place: brief?.place ?? '',
    words: brief?.words ?? '',
    left: siteFile(p.brief, p.left),
    right: siteFile(p.brief, p.right),
  }
})
const key = shown.map((s, i) => ({ ...s, words: undefined, key: ordered[i] }))
writeFileSync(new URL('rating-key.json', runDir), JSON.stringify(key, null, 2))

const template = readFileSync(new URL('rating-template.html', import.meta.url), 'utf8')
writeFileSync(
  new URL('index.html', outDir),
  template.replace(
    '/*PAIRS*/[]',
    JSON.stringify(
      shown.map(({ n, id, name, place, words, left, right }) => ({
        n,
        id,
        name,
        place,
        words,
        left,
        right,
      })),
    ),
  ),
)
console.log(`${shown.length} pairs → ${outDir.pathname}`)
