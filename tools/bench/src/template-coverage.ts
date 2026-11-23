// Which templates the design pick chooses, over many briefs (POST /api/template-pick: Jev only,
// no words or photos). Counts first and top-three picks per template, lists templates never in
// anyone's top three, and the briefs where no template is a clear fit. For deciding which new
// templates to make (docs/m0/28-more-templates.md).
//   node src/template-coverage.ts        (dev server on :5173 with BENCH=1)
import { mkdirSync, writeFileSync } from 'node:fs'
import type { Brief } from './briefs.ts'
import { WIDE } from './wide.ts'

/** Areas the wide set has little of: night, music and arts, style, stays, tech, people, events. */
const EXTRA: Brief[] = [
  ['cocktail-bar', 'Speakeasy cocktail bar in Glasgow, low lights, jazz on Thursdays', 'nightlife'],
  ['techno-club', 'Techno club in Berlin, open Friday to Sunday, two rooms', 'nightlife'],
  ['wine-bar', 'Natural wine bar in Lisbon with small plates', 'nightlife'],
  ['pub', 'Old pub in a Yorkshire village, real ales, quiz on Tuesdays', 'nightlife'],
  ['comedy', 'Comedy club in Manchester, open mic on Mondays', 'nightlife'],
  ['tattoo', 'Blackwork tattoo studio in Bristol, appointments only', 'style'],
  ['barber-dark', 'Moody barbershop in Camden with whisky and vinyl', 'style'],
  ['boutique', 'Independent fashion boutique in Brighton, vintage and new', 'style'],
  ['jeweller', 'Fine jewellery maker in Edinburgh, engagement rings to order', 'style'],
  ['perfume', 'Small perfume house in Paris, hand-blended scents', 'style'],
  ['band', 'Indie rock band from Leeds, new album out in March', 'music'],
  ['dj', 'Wedding and party DJ in Cardiff', 'music'],
  ['recording', 'Recording studio in Nashville with a vintage desk', 'music'],
  ['orchestra', 'Community orchestra in Oxford, concerts each season', 'music'],
  ['gallery', 'Contemporary art gallery in Glasgow', 'arts'],
  ['theatre', 'Small fringe theatre in London, new writing', 'arts'],
  ['novelist', 'Author website for a crime novelist', 'arts'],
  ['photographer', 'Portfolio for a black-and-white street photographer', 'arts'],
  ['illustrator', "Children's book illustrator in Bristol", 'arts'],
  ['boutique-hotel', 'Boutique hotel in Edinburgh old town, twelve rooms', 'stays'],
  ['cabin', 'Off-grid cabins in the Scottish Highlands with hot tubs', 'stays'],
  ['campsite', 'Family campsite in Cornwall near the beach', 'stays'],
  ['saas', 'Software startup making invoicing simple for freelancers', 'tech'],
  ['app', 'Mobile app that helps people learn Spanish in five minutes a day', 'tech'],
  ['agency', 'Small digital design agency in Amsterdam', 'tech'],
  ['dev-portfolio', 'Portfolio for a freelance web developer', 'people'],
  ['cv', 'Personal CV site for a nurse looking for work', 'people'],
  ['coach', 'Life coach for new parents, online sessions', 'people'],
  ['wedding', 'Our wedding website: Anna and Tom, 14 June, Lake Como', 'events'],
  ['festival', 'Three-day folk music festival in Somerset', 'events'],
  ['conference', 'Design conference in Copenhagen, two days in October', 'events'],
  ['party', "Birthday party page for Lily's 7th, dinosaurs theme", 'events'],
  ['nursery', 'Forest school nursery for 2 to 5 year olds', 'kids'],
  ['kids-party', "Children's party entertainer with magic and balloons", 'kids'],
  ['surf', 'Surf school in Newquay, lessons for all ages', 'outdoors'],
  ['climbing', 'Bouldering gym in Sheffield', 'outdoors'],
  ['vineyard', 'Family vineyard in Kent with tastings', 'outdoors'],
  ['outlaw', 'portfolio page for dutch van der linde', 'famous'],
  ['singer', 'page for Taylor Swift', 'famous'],
  ['museum', 'a website for the British Museum', 'famous'],
  ['horror', 'Escape room in York with a haunted house theme', 'leisure'],
  ['gaming', 'Retro arcade bar in Manchester', 'leisure'],
].map(([id, words, area]) => ({ id: `x-${id}`, words: words ?? '', tags: [area ?? ''] }))

const briefs = [...WIDE, ...EXTRA]
type Row = { id: string; words: string; area: string; top: { id: string; p: number }[] }
const rows: Row[] = []
for (const b of briefs) {
  let res: Response | null = null
  for (let i = 0; i < 3 && !res?.ok; i++)
    res = await fetch('http://localhost:5173/api/template-pick', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ words: b.words }),
    }).catch(() => null)
  const j = (await res?.json().catch(() => null)) as { ranked?: { id: string; p: number }[] } | null
  if (!j?.ranked) continue
  rows.push({ id: b.id, words: b.words, area: b.tags[0] ?? '', top: j.ranked.slice(0, 3) })
}

const first = new Map<string, number>()
const three = new Map<string, number>()
for (const r of rows) {
  const f = r.top[0]?.id
  if (f) first.set(f, (first.get(f) ?? 0) + 1)
  for (const t of r.top) three.set(t.id, (three.get(t.id) ?? 0) + 1)
}
const all = (await (await fetch('http://localhost:5173/api/template')).json()) as {
  id: string
  label: string
}[]
console.log(`${rows.length} briefs\n\nFirst pick / in top three, per template:`)
for (const t of [...all].sort((a, b) => (three.get(b.id) ?? 0) - (three.get(a.id) ?? 0)))
  console.log(
    `  ${t.label.padEnd(16)} ${String(first.get(t.id) ?? 0).padStart(3)} ${String(three.get(t.id) ?? 0).padStart(4)}`,
  )
console.log(
  '\nNever in a top three:',
  all
    .filter((t) => !three.has(t.id))
    .map((t) => t.label)
    .join(', ') || 'none',
)
const weak = rows
  .filter((r) => (r.top[0]?.p ?? 0) < 0.12)
  .sort((a, b) => (a.top[0]?.p ?? 0) - (b.top[0]?.p ?? 0))
console.log(`\nNo clear fit (first pick under 0.12): ${weak.length}`)
for (const r of weak.slice(0, 40))
  console.log(
    `  ${(r.top[0]?.p ?? 0).toFixed(2)} [${r.area}] ${r.words.slice(0, 70)} → ${r.top.map((t) => t.id).join(', ')}`,
  )
mkdirSync(new URL('../runs/', import.meta.url), { recursive: true })
writeFileSync(
  new URL(`../runs/coverage-${Date.now()}.json`, import.meta.url),
  JSON.stringify(rows, null, 1),
)
