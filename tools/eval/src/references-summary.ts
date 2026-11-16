// Summarises the measured reference library (references/measured.json) per kind of business:
// what the best real local-business sites actually do, as numbers we can turn into rules.
// Run: node src/references-summary.ts  → prints, and writes references/summary.json.
import { readFileSync, writeFileSync } from 'node:fs'

type M = {
  name: string
  kind: number
  desktop?: {
    height: number
    headline: {
      family?: string
      size: number
      weight: string
      transform: string
      tracking: string
    } | null
    headlineBox: { x: number; y: number; w: number; h: number } | null
    body: { family?: string; size: number; lineHeight: string } | null
    button: { radius: string; transform: string; bg: string } | null
    families: [string, number][]
    pageBg: string
    areas: [string, number][]
    firstScreenPhoto: number
  }
}

const data = JSON.parse(
  readFileSync(new URL('../references/measured.json', import.meta.url), 'utf8'),
) as M[]
const KIND = ['', 'restaurants', 'salons', 'clinics', 'trades', 'fitness']

const rgb = (s: string) => (s.match(/[\d.]+/g) ?? []).map(Number)
/** Relative luminance, 0 (black) to 1 (white). */
const lum = (s: string) => {
  const [r = 0, g = 0, b = 0, a = 1] = rgb(s)
  if (a === 0) return 1
  const f = (v: number) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
/** Saturation in HSL terms, 0–1. */
const sat = (s: string) => {
  const [r = 0, g = 0, b = 0] = rgb(s).map((v) => v / 255)
  const mx = Math.max(r, g, b)
  const mn = Math.min(r, g, b)
  const l = (mx + mn) / 2
  return mx === mn ? 0 : (mx - mn) / (1 - Math.abs(2 * l - 1))
}
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b)
  return s.length ? (s[Math.floor(s.length / 2)] ?? 0) : 0
}
const pct = (n: number, d: number) => `${Math.round((100 * n) / Math.max(1, d))}%`
const GENERIC =
  /^(inter|roboto|arial|helvetica|system-ui|-apple-system|open sans|times|georgia|sans-serif|serif)$/i

const summary: Record<string, unknown> = {}
for (const k of [1, 2, 3, 4, 5]) {
  const ms = data.filter((m) => m.kind === k && m.desktop)
  const d = ms.map((m) => m.desktop as NonNullable<M['desktop']>)
  const ground = d.map((x) => {
    const top = x.areas.find(([c]) => c !== 'image')?.[0] ?? x.pageBg
    const L = lum(top)
    return L > 0.97 && sat(top) < 0.05
      ? 'pure white'
      : L > 0.75
        ? 'off-white or light tint'
        : L > 0.2
          ? 'mid colour'
          : 'dark'
  })
  const count = (xs: string[]) => {
    const c: Record<string, number> = {}
    for (const x of xs) c[x] = (c[x] ?? 0) + 1
    return Object.fromEntries(Object.entries(c).sort((a, b) => b[1] - a[1]))
  }
  // A strong colour: a painted area that is neither near-white nor near-black and is saturated.
  const strong = d.filter((x) =>
    x.areas.some(
      ([c, n]) => c !== 'image' && n >= 8 && sat(c) > 0.35 && lum(c) > 0.02 && lum(c) < 0.75,
    ),
  ).length
  const heads = d.map((x) => x.headline).filter((h): h is NonNullable<typeof h> => !!h)
  const radius = d
    .map((x) => x.button?.radius)
    .filter((r): r is string => !!r)
    .map((r) =>
      Number.parseFloat(r) >= 20 ? 'pill' : Number.parseFloat(r) > 0 ? 'rounded' : 'square',
    )
  const families = d.map((x) => x.families.filter(([, n]) => n > 80).length)
  summary[KIND[k] ?? k] = {
    sites: d.length,
    ground: count(ground),
    strongColourArea: pct(strong, d.length),
    firstScreenPhotoMedian: `${Math.round(100 * median(d.map((x) => x.firstScreenPhoto)))}%`,
    photoLedOpenings: pct(d.filter((x) => x.firstScreenPhoto > 0.6).length, d.length),
    headlinePxMedian: Math.round(median(heads.map((h) => h.size))),
    headlinePxRange: [
      Math.round(Math.min(...heads.map((h) => h.size))),
      Math.round(Math.max(...heads.map((h) => h.size))),
    ],
    headlineUppercase: pct(heads.filter((h) => h.transform === 'uppercase').length, heads.length),
    bodyPxMedian: median(d.map((x) => x.body?.size ?? 0).filter(Boolean)),
    facesUsedMedian: median(families),
    genericFaceOnly: pct(d.filter((x) => GENERIC.test(x.families[0]?.[0] ?? '')).length, d.length),
    buttons: count(radius),
    displayFaces: [...new Set(heads.map((h) => h.family).filter(Boolean))].slice(0, 30),
  }
}
writeFileSync(
  new URL('../references/summary.json', import.meta.url),
  `${JSON.stringify(summary, null, 2)}\n`,
)
console.log(JSON.stringify(summary, null, 2))
