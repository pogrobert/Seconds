// Measures every stock photo once (docs/m0/11-readable-photos.md): each photo is decoded in
// Chromium at 160 px wide, and photoTone() records how light and busy its thirds are. The result
// is written next to the photo's credit in photos/manifest.json and photos/directions.json, and
// sampleAssets() puts it on the asset, as the product will when an owner uploads a photo.
// Run: pnpm --filter @repo/eval photo-tones
import { readFileSync, writeFileSync } from 'node:fs'
import { photoTone } from '@repo/pipeline'
import { chromium } from 'playwright'
import { it } from 'vitest'

const dir = new URL('../photos/', import.meta.url)
type Entry = { file: string; tone?: unknown }

it('measures the tone of every stock photo', async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  const measure = async (file: string) => {
    const bytes = readFileSync(new URL(file, dir)).toString('base64')
    const { data, w, h } = await page.evaluate(async (src) => {
      const img = new Image()
      img.src = src
      await img.decode()
      const w = 160
      const h = Math.round((img.naturalHeight / img.naturalWidth) * w)
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      const g = c.getContext('2d') as CanvasRenderingContext2D
      g.drawImage(img, 0, 0, w, h)
      return { data: Array.from(g.getImageData(0, 0, w, h).data), w, h }
    }, `data:image/jpeg;base64,${bytes}`)
    return photoTone(data, w, h)
  }
  for (const name of ['manifest.json', 'directions.json']) {
    const url = new URL(name, dir)
    const m = JSON.parse(readFileSync(url, 'utf8')) as Record<
      string,
      Record<string, Entry> | Entry[]
    >
    for (const group of Object.values(m))
      for (const entry of Object.values(group) as Entry[]) entry.tone = await measure(entry.file)
    writeFileSync(url, `${JSON.stringify(m, null, 2)}\n`)
  }
  await browser.close()
}, 300_000)
