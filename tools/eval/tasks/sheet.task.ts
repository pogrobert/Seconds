// Contact sheet: every block variant, in each M0 style family, rendered with the typical test content
// and photographed in Chromium at 1280 px, one image per section type and family.
// Output: tools/eval/out/sheet/<family>/<section>.png. Run: pnpm --filter @repo/eval sheet
import { mkdirSync } from 'node:fs'
import { generate, toSvg } from '@pogrobert/surfaces'
import { siteCss } from '@repo/blocks/build'
import { components, type RenderCtx } from '@repo/blocks/components'
import { eligibility, manifests } from '@repo/blocks/manifest'
import { M0_FAMILIES, theme } from '@repo/blocks/themes'
import { fixtures, M0_SECTIONS } from '@repo/spec/fixtures'
import { chromium } from 'playwright'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { it } from 'vitest'

const BRAND = '#5b4a7a'

it('photographs every variant in every M0 family', async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  for (const family of M0_FAMILIES) {
    const t = theme(family, BRAND)
    const css = await siteCss(
      manifests.map((m) => m.type),
      t.css,
    )
    const dir = new URL(`../out/sheet/${family}/`, import.meta.url)
    mkdirSync(dir, { recursive: true })
    for (const section of M0_SECTIONS) {
      const parts: string[] = []
      for (const m of manifests.filter((x) => x.sectionType === section)) {
        for (const variant of Object.keys(m.variants)) {
          const f = fixtures[section].typical
          let content = f.content as Record<string, unknown>
          if (!eligibility(m, variant, content).ok)
            content = fixtures[section].rtl.content as Record<string, unknown>
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
            image: (img, o) => {
              const w = 1000
              const h = Math.round(w / (o.aspect ?? 1.5))
              const svg = toSvg(
                generate({
                  style: t.art as 'riso',
                  seed: img.asset,
                  color: BRAND,
                  width: w,
                  height: h,
                }),
              )
              return {
                src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
                width: w,
                height: h,
              }
            },
          }
          const C = components[m.type]
          if (!C) continue
          parts.push(
            `<div style="font:600 13px system-ui;padding:6px 12px;background:#222;color:#fff">${m.type} #${variant}</div>`,
          )
          parts.push(
            renderToStaticMarkup(createElement(C, { content: content as never, variant, ctx })),
          )
        }
      }
      const html = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${t.fontsHref}"><style>${css}</style></head><body data-site>${parts.join('')}</body></html>`
      await page.setContent(html, { waitUntil: 'networkidle' })
      await page.evaluate(() => document.fonts.ready)
      await page.screenshot({ path: new URL(`${section}.png`, dir).pathname, fullPage: true })
    }
  }
  await browser.close()
})
