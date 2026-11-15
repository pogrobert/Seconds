import type { Tone } from '@repo/spec'

// Measuring a photo once, when it arrives (docs/m0/11-readable-photos.md): how light and how busy
// its top, middle and bottom thirds are. Blocks read the result to put words on the calmest part
// and shade only as much as that photo needs. Pure: the caller decodes the image into RGBA pixels
// (a canvas in the browser, an image service on the server), at any small size.

/** sRGB channel (0 to 255) to linear light. */
const lin = (c: number) => {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

/**
 * The tone of an image from its RGBA pixels. `light` is the mean relative luminance (0 black, 1
 * white). `busy` is how much the luminance changes between neighbouring pixels, scaled so that a
 * clear sky is near 0 and dense foliage or wiring is near 1.
 */
export function photoTone(rgba: ArrayLike<number>, width: number, height: number): Tone {
  const lum = new Float32Array(width * height)
  for (let i = 0; i < width * height; i++)
    lum[i] =
      0.2126 * lin(rgba[i * 4] ?? 0) +
      0.7152 * lin(rgba[i * 4 + 1] ?? 0) +
      0.0722 * lin(rgba[i * 4 + 2] ?? 0)
  const band = (y0: number, y1: number) => {
    let sum = 0
    let edge = 0
    let n = 0
    let m = 0
    for (let y = y0; y < y1; y++)
      for (let x = 0; x < width; x++) {
        const v = lum[y * width + x] ?? 0
        sum += v
        n++
        if (x + 1 < width && y + 1 < y1) {
          edge +=
            Math.abs(v - (lum[y * width + x + 1] ?? 0)) +
            Math.abs(v - (lum[(y + 1) * width + x] ?? 0))
          m++
        }
      }
    const round = (x: number) => Math.round(Math.min(1, Math.max(0, x)) * 1000) / 1000
    // Perceived lightness: the cube root follows how light the band looks, not its raw energy.
    return { light: round(Math.cbrt(n ? sum / n : 0)), busy: round(m ? (edge / m) * 5 : 0) }
  }
  const a = Math.round(height / 3)
  const b = Math.round((2 * height) / 3)
  return { top: band(0, a), middle: band(a, b), bottom: band(b, height) }
}
