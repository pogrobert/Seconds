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
  if (!p || !existsSync(new URL(p.file, photosDir))) return ''
  // SHEET_PUBLISH=1 writes paths relative to the sheet pages, for publishing; otherwise absolute file URLs.
  return process.env.SHEET_PUBLISH ? `../photos/${p.file}` : new URL(p.file, photosDir).href
}

/**
 * Content that shows a variant at its best: the typical case, plus any field the variant requires
 * (photo, gallery, form) taken from the longest case, text cut to the variant's caps, and item
 * photos added when the variant shows images. So every variant appears on the sheet.
 */
function showcase(
  m: BlockManifest,
  variant: string,
  section: M0Section,
): Record<string, unknown> | null {
  const v = m.variants[variant]
  if (!v) return null
  const typical = { ...(fixtures[section].typical.content as Record<string, unknown>) }
  const longest = fixtures[section].longest.content as Record<string, unknown>
  const rtl = fixtures[section].rtl.content as Record<string, unknown>
  for (const f of (v.requires ?? []) as readonly string[])
    if (typical[f] === undefined) typical[f] = longest[f] ?? rtl[f]
  for (const [f, cap] of Object.entries(v.caps ?? {}) as [string, number | { max?: number }][]) {
    const max = typeof cap === 'number' ? cap : cap.max
    const value = typical[f]
    if (typeof value === 'string' && max !== undefined && value.length > max)
      typical[f] = value.slice(0, max).trimEnd()
    if (
      Array.isArray(value) &&
      max !== undefined &&
      value.length > max &&
      !(value[0] && 'spans' in (value[0] as object))
    )
      typical[f] = value.slice(0, max)
  }
  if (v.signature.media !== 'none' && Array.isArray(typical.items))
    typical.items = (typical.items as Record<string, unknown>[]).map((it, i) =>
      it.media
        ? it
        : {
            ...it,
            media: { asset: `a_00000000${String(30 + i).padStart(2, '0')}`, alt: 'Salon detail' },
          },
    )
  return eligibility(m, variant, typical).ok ? typical : null
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
          const f = fixtures[section].typical
          const content = showcase(m, variant, section)
          if (!content) continue
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
