// Contact sheets: every block variant (or one block, with BLOCK=<folder>) in each M0 style family,
// with the typical test content and real photos, photographed in Chromium at 1280 px and 390 px.
// Output: tools/eval/out/sheet/<family>/<section or block>-<width>.png
// Run: pnpm --filter @repo/eval sheet       or    BLOCK=hero-editorial pnpm --filter @repo/eval sheet
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { siteCss } from '@repo/blocks/build'
import { components, type RenderCtx } from '@repo/blocks/components'
import { type BlockManifest, eligibility, manifests as registered } from '@repo/blocks/manifest'
import { M0_FAMILIES, theme } from '@repo/blocks/themes'
import { fixtures, M0_SECTIONS, type M0Section } from '@repo/spec/fixtures'
import { chromium } from 'playwright'
import { type ComponentType, createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { it } from 'vitest'
import { readManifest } from '../src/photos.ts'

const BRAND = '#5b4a7a'
const only = process.env.BLOCK
// The test business is a salon: its pictures are the salon's licensed photos, in turn.
const photosDir = new URL('../photos/', import.meta.url)
const salon = Object.values(readManifest().salon ?? {})
const photoFor = (asset: string) => {
  const n = Number.parseInt(asset.replace(/\D/g, ''), 10) || 0
  const p = salon[n % Math.max(salon.length, 1)]
  return p && existsSync(new URL(p.file, photosDir)) ? new URL(p.file, photosDir).href : ''
}

async function load(): Promise<{ m: BlockManifest; C: ComponentType<never> }[]> {
  if (!only)
    return registered.flatMap((m) =>
      components[m.type] ? [{ m, C: components[m.type] as ComponentType<never> }] : [],
    )
  const m = (await import(`../../../packages/blocks/src/blocks/${only}/manifest.ts`))
    .default as BlockManifest
  const C = (await import(`../../../packages/blocks/src/blocks/${only}/component.tsx`))
    .default as ComponentType<never>
  return [{ m, C }]
}

it('photographs block variants in every M0 family', async () => {
  const blocks = await load()
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  for (const family of M0_FAMILIES) {
    const t = theme(family, BRAND)
    const css = await siteCss(
      blocks.map((b) => b.m.type),
      t.css,
    )
    const dir = new URL(`../out/sheet/${family}/`, import.meta.url)
    mkdirSync(dir, { recursive: true })
    const groups = only ? [only] : M0_SECTIONS
    for (const group of groups) {
      const parts: string[] = []
      for (const { m, C } of blocks.filter((b) => (only ? true : b.m.sectionType === group))) {
        const section = m.sectionType as M0Section
        for (const variant of Object.keys(m.variants)) {
          let f = fixtures[section].typical
          if (!eligibility(m, variant, f.content as Record<string, unknown>).ok)
            f = fixtures[section].rtl
          const content = f.content as Record<string, unknown>
          if (!eligibility(m, variant, content).ok) continue
          const ctx: RenderCtx = {
            id: 'b_0000000001',
            section,
            type: m.type,
            variant,
            surface: 'base',
            headingLevel: 2,
            button: t.button,
            href: () => '#',
            business: f.context.business,
            collection: (id) => f.context.collections[id],
            locale: 'en-GB',
            dir: 'ltr',
            formAction: () => '#',
            image: (img, o) => ({
              src: photoFor(img.asset),
              width: 1280,
              height: Math.round(1280 / (o.aspect ?? 1.5)),
            }),
          }
          parts.push(
            `<div style="font:600 13px system-ui;padding:6px 12px;background:#222;color:#fff">${m.type} #${variant}</div>`,
          )
          parts.push(renderToStaticMarkup(createElement(C, { content, variant, ctx } as never)))
        }
      }
      const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="${t.fontsHref}"><style>${css}</style></head><body data-site>${parts.join('')}</body></html>`
      const file = new URL(`${group}.html`, dir)
      writeFileSync(file, html)
      for (const width of [1280, 390]) {
        await page.setViewportSize({ width, height: 900 })
        await page.goto(file.href, { waitUntil: 'networkidle' })
        await page.evaluate(() => document.fonts.ready)
        await page.screenshot({
          path: new URL(`${group}-${width}.png`, dir).pathname,
          fullPage: true,
        })
      }
    }
  }
  await browser.close()
})
