import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import AxeBuilder from '@axe-core/playwright'
import { generate, toSvg } from '@pogrobert/surfaces'
import { contentSchema } from '@repo/spec'
import { CASES, fixtures, M0_SECTIONS, type M0Section } from '@repo/spec/fixtures'
import { type Browser, chromium } from 'playwright'
import { type ComponentType, createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { BlockProps, RenderCtx } from '../../src/kit/index.tsx'
import { type BlockManifest, eligibility } from '../../src/manifest/contract.ts'
import { classesIn, contentAtCaps, kitCompiler, root, testCtx } from '../helpers.ts'

// Real-browser checks (CLAUDE.md, Quality checks): every block, variant and test case, plus the
// longest text each variant claims to hold, rendered in Chromium at phone, tablet and desktop widths.
// Fails on: page wider than the screen, elements sticking out, text overflowing or clipped, and
// accessibility violations found by axe-core (WCAG 2.2 A and AA).
// Images are generated art from Surfaces. Fonts are the draft theme's system fonts: checks per
// font pairing come with the style families.

const WIDTHS = [360, 768, 1280] as const
const only = process.env.BLOCK
const dirs = readdirSync(join(root, 'src/blocks'), { withFileTypes: true })
  .filter((d) => d.isDirectory() && (!only || d.name === only))
  .map((d) => d.name)
  .sort()

async function stylesheet() {
  const compiler = await kitCompiler()
  const sources = [
    ...['primitives.tsx', 'facts.tsx'].map((f) => join(root, 'src/kit', f)),
    ...readdirSync(join(root, 'src/blocks')).map((d) =>
      join(root, 'src/blocks', d, 'component.tsx'),
    ),
  ]
  const candidates = [...new Set(sources.flatMap((f) => classesIn(readFileSync(f, 'utf8'))))]
  return compiler.build(candidates) + readFileSync(join(root, 'src/kit/draft-theme.css'), 'utf8')
}

const art = new Map<string, string>()
function artUri(asset: string, aspect: number) {
  const key = `${asset}:${aspect.toFixed(3)}`
  let uri = art.get(key)
  if (!uri) {
    const width = 1200
    const svg = toSvg(
      generate({
        style: 'riso',
        seed: asset,
        color: '#4a6b5d',
        width,
        height: Math.round(width / aspect),
      }),
    )
    uri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
    art.set(key, uri)
  }
  return uri
}

function page(html: string, css: string, rtl: boolean) {
  return `<!doctype html><html lang="${rtl ? 'ar' : 'en'}" dir="${rtl ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Block check</title><style>${css}</style></head><body data-site>${html}</body></html>`
}

/** Layout problems, measured by the browser. */
const measure = () => {
  const vw = document.documentElement.clientWidth
  const out: string[] = []
  const name = (el: Element) =>
    `<${el.tagName.toLowerCase()}${el.getAttribute('data-slot') ? ` data-slot="${el.getAttribute('data-slot')}"` : ''}${el.className && typeof el.className === 'string' ? ` class="${el.className.slice(0, 60)}"` : ''}>`
  if (document.documentElement.scrollWidth > vw + 1)
    out.push(`page is ${document.documentElement.scrollWidth}px wide in a ${vw}px window`)
  for (const el of Array.from(document.body.querySelectorAll('*'))) {
    const r = el.getBoundingClientRect()
    if (r.width === 0 && r.height === 0) continue
    if (r.right > vw + 1 || r.left < -1)
      out.push(
        `${name(el)} sticks out of the window (${Math.round(r.left)} to ${Math.round(r.right)})`,
      )
    const cs = getComputedStyle(el)
    const hasText = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent?.trim())
    if (!hasText || cs.display.startsWith('inline')) continue
    if (el.scrollWidth > el.clientWidth + 1)
      out.push(`${name(el)} text is wider than its box (${el.scrollWidth} > ${el.clientWidth})`)
    if (['hidden', 'clip'].includes(cs.overflowY) && el.scrollHeight > el.clientHeight + 1)
      out.push(`${name(el)} text is clipped (${el.scrollHeight} > ${el.clientHeight})`)
  }
  return out.slice(0, 8)
}

let browser: Browser
let css = ''
beforeAll(async () => {
  browser = await chromium.launch()
  css = await stylesheet()
})
afterAll(async () => browser?.close())

for (const dir of dirs) {
  const m = (await import(`../../src/blocks/${dir}/manifest.ts`)).default as BlockManifest
  const C = (await import(`../../src/blocks/${dir}/component.tsx`)).default as ComponentType<
    BlockProps<never>
  >
  if (!(M0_SECTIONS as readonly string[]).includes(m.sectionType)) continue
  const section = m.sectionType as M0Section
  describe(dir, () => {
    for (const variant of Object.keys(m.variants)) {
      const cases: {
        name: string
        content: Record<string, unknown>
        rtl: boolean
        context: (typeof fixtures)[M0Section]['typical']['context']
      }[] = []
      for (const c of CASES) {
        const f = fixtures[section][c]
        if (eligibility(m, variant, f.content as Record<string, unknown>).ok)
          cases.push({
            name: c,
            content: f.content as Record<string, unknown>,
            rtl: c === 'rtl',
            context: f.context,
          })
      }
      const capped = contentAtCaps(
        m,
        variant,
        fixtures[section].longest.content as Record<string, unknown>,
        fixtures[section].typical.content as Record<string, unknown>,
      )
      if (capped)
        cases.push({
          name: 'at-caps',
          content: capped,
          rtl: false,
          context: fixtures[section].longest.context,
        })

      for (const tc of cases) {
        it(`#${variant} / ${tc.name}`, async () => {
          if (tc.name === 'at-caps')
            expect(
              contentSchema(section).safeParse(tc.content).success,
              'at-caps content is not valid',
            ).toBe(true)
          const base = testCtx(section, m.type, variant, tc.context, tc.rtl)
          const ctx: RenderCtx = {
            ...base,
            image: (img, o) => ({
              src: artUri(img.asset, o.aspect ?? 1),
              width: 1200,
              height: Math.round(1200 / (o.aspect ?? 1)),
            }),
          }
          const html = renderToStaticMarkup(
            createElement(C, { content: tc.content as never, variant, ctx }),
          )
          const context = await browser.newContext()
          const p = await context.newPage()
          const problems: string[] = []
          try {
            for (const width of WIDTHS) {
              await p.setViewportSize({ width, height: 900 })
              await p.setContent(page(html, css, tc.rtl))
              problems.push(...(await p.evaluate(measure)).map((x) => `${width}px: ${x}`))
              if (width !== 768) {
                const axe = await new AxeBuilder({ page: p })
                  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
                  .disableRules(['page-has-heading-one', 'landmark-one-main', 'region', 'bypass'])
                  .analyze()
                for (const v of axe.violations)
                  problems.push(
                    `${width}px: axe ${v.id}: ${v.help} (${v.nodes.length}) ${v.nodes[0]?.target.join(' ') ?? ''}`,
                  )
              }
            }
          } finally {
            await context.close()
          }
          expect(problems).toEqual([])
        })
      }
    }
  })
}
