import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { generate, toSvg } from '@pogrobert/surfaces'
import { candidatesIn, kitCompiler, root } from '../helpers.ts'

// Pieces shared by the browser checks: which blocks to check, the stylesheet, test pictures, the
// page wrapper and the layout measurements.

export const WIDTHS = [360, 768, 1280] as const
export const only = process.env.BLOCK
export const dirs = readdirSync(join(root, 'src/blocks'), { withFileTypes: true })
  .filter((d) => d.isDirectory() && (!only || d.name === only))
  .map((d) => d.name)
  .sort()

/** The kit and every block's classes, plus a theme (the draft placeholder theme by default). */
export async function stylesheet(themeCss?: string) {
  const compiler = await kitCompiler()
  const sources = [
    ...['primitives.tsx', 'facts.tsx', 'core.ts'].map((f) => join(root, 'src/kit', f)),
    ...readdirSync(join(root, 'src/blocks'))
      .map((d) => join(root, 'src/blocks', d, 'component.tsx'))
      .filter((f) => existsSync(f)), // another agent's folder may still be empty
  ]
  const candidates = [...new Set(sources.flatMap((f) => candidatesIn(readFileSync(f, 'utf8'))))]
  return (
    compiler.build(candidates) +
    (themeCss ?? readFileSync(join(root, 'src/kit/draft-theme.css'), 'utf8'))
  )
}

const art = new Map<string, string>()
export function artUri(asset: string, aspect: number) {
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

export function page(html: string, css: string, rtl: boolean, head = '') {
  return `<!doctype html><html lang="${rtl ? 'ar' : 'en'}" dir="${rtl ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Block check</title>${head}<style>${css}</style></head><body data-site>${html}</body></html>`
}

/** Layout problems, measured by the browser. */
export const measure = () => {
  const vw = document.documentElement.clientWidth
  const out: string[] = []
  const name = (el: Element) =>
    `<${el.tagName.toLowerCase()}${el.getAttribute('data-slot') ? ` data-slot="${el.getAttribute('data-slot')}"` : ''}${el.className && typeof el.className === 'string' ? ` class="${el.className.slice(0, 60)}"` : ''}>`
  if (document.documentElement.scrollWidth > vw + 1)
    out.push(`page is ${document.documentElement.scrollWidth}px wide in a ${vw}px window`)
  for (const el of Array.from(document.body.querySelectorAll('*'))) {
    const r = el.getBoundingClientRect()
    if (r.width === 0 && r.height === 0) continue
    // Visually hidden on purpose (screen-reader text such as sr-only): 1px boxes or clipped away.
    const vis = getComputedStyle(el)
    if (
      (r.width <= 1 && r.height <= 1) ||
      vis.clipPath === 'inset(50%)' ||
      (vis.clip !== 'auto' && vis.position === 'absolute')
    )
      continue
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
