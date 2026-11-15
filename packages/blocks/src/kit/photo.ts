import type { ImageRef, Tone } from '@repo/spec'

// Light words on a photo, readable whatever the photo (docs/m0/11-readable-photos.md). From the
// photo's measured tone: which third the words sit on (the calmest of those allowed), how strong a
// soft halo of shade goes behind them, and whether the whole photo needs a light dim. Shading only
// as much as each photo needs keeps bright, calm photos bright.

export type Band = 'top' | 'middle' | 'bottom'

/** Halo strengths, as literal classes so the stylesheet build finds them. */
const HALO = [
  'opacity-0',
  'opacity-20',
  'opacity-30',
  'opacity-40',
  'opacity-50',
  'opacity-60',
  'opacity-70',
  'opacity-80',
] as const
const DIM = ['opacity-0', 'opacity-10', 'opacity-20', 'opacity-30'] as const

/** Relative luminance back from the measured lightness (the cube root of it). */
const lum = (light: number) => light ** 3

export function wordsOn(
  tones: readonly (Tone | undefined)[],
  allowed: readonly Band[],
): { band: Band; halo: string; dim: string } {
  const known = tones.filter((t): t is Tone => !!t)
  // Unmeasured photo: the middle strength, which suits most photos.
  if (!known.length) return { band: allowed[0] ?? 'middle', halo: 'opacity-50', dim: 'opacity-10' }
  const worst = (b: Band) => ({
    light: Math.max(...known.map((t) => t[b].light)),
    busy: Math.max(...known.map((t) => t[b].busy)),
  })
  // The calmest allowed third; the first allowed wins unless another is clearly calmer.
  let band = allowed[0] ?? 'middle'
  const score = (b: Band) => worst(b).busy + 0.5 * worst(b).light
  for (const b of allowed) if (score(b) < score(band) - 0.1) band = b
  const w = worst(band)
  // Thin, light type needs more than the 3:1 that large type is allowed: aim for about 6:1 on the
  // band, add more where it is busy, and never less than a light halo.
  const need = Math.max(0.3, Math.max(0, 1 - 0.12 / Math.max(lum(w.light), 0.12)) + 0.6 * w.busy)
  const halo = HALO[Math.min(HALO.length - 1, Math.ceil(need * 10) - 1)] ?? 'opacity-0'
  const mean =
    known.reduce((a, t) => a + (t.top.light + t.middle.light + t.bottom.light) / 3, 0) /
    known.length
  const dim =
    DIM[Math.max(0, Math.min(DIM.length - 1, Math.round((mean - 0.55) * 10)))] ?? 'opacity-0'
  return { band, halo, dim }
}

/** A photo's measured tone, as the renderer hands it to blocks. */
export const toneOf = (
  ctx: { image: (img: ImageRef, o: { sizes: string }) => { tone?: Tone } },
  img: ImageRef,
) => ctx.image(img, { sizes: '100vw' }).tone
