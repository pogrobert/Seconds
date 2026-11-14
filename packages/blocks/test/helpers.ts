import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { LinkTarget, SectionTypeName } from '@repo/spec'
import type { Context } from '@repo/spec/fixtures'
import { compile } from 'tailwindcss'
import type { RenderCtx } from '../src/kit/index.tsx'

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)

/** A render context for tests: fixed ids, predictable URLs. */
export function testCtx(
  section: SectionTypeName,
  type: string,
  variant: string,
  context: Context,
  rtl = false,
): RenderCtx {
  const href = (to: LinkTarget): string => {
    switch (to.type) {
      case 'page':
        return `/${to.page}${to.anchor ? `#${to.anchor}` : ''}`
      case 'item':
        return `/${to.collection}/${to.item}`
      case 'url':
        return to.url
      case 'asset':
        return `/files/${to.asset}`
      case 'contact':
        return `#contact-${to.channel}`
    }
  }
  return {
    id: 'b_0000000001',
    section,
    type,
    variant,
    surface: 'base',
    headingLevel: 1,
    button: 'solid',
    href,
    image: (img, o) => ({
      src: `/img/${img.asset}.jpg`,
      width: 800,
      height: Math.round(800 / (o.aspect ?? 1)),
    }),
    business: context.business,
    collection: (id) => context.collections[id],
    locale: rtl ? 'ar' : 'en-GB',
    dir: rtl ? 'rtl' : 'ltr',
    formAction: (form) => `/_x/forms/${form.form}`,
  }
}

/** Tailwind compiled with the kit stylesheet: the only classes that exist for a block. */
export async function kitCompiler() {
  const kitPath = join(root, 'src/kit/kit.css')
  const loadStylesheet = async (id: string, base: string) => {
    const path = id.startsWith('.') ? resolve(base, id) : require.resolve(id)
    return { path, base: dirname(path), content: readFileSync(path, 'utf8') }
  }
  return compile(readFileSync(kitPath, 'utf8'), { base: dirname(kitPath), loadStylesheet })
}

/**
 * Class names written in a source file. Classes must be literal strings inside className="…"
 * or inside cx(…), so they can be read and checked here (no string building).
 */
export function classesIn(source: string): string[] {
  const found = new Set<string>()
  const add = (s: string) => {
    for (const c of s.split(/\s+/)) if (c) found.add(c)
  }
  for (const m of source.matchAll(/className="([^"]*)"/g)) add(m[1] ?? '')
  for (const m of source.matchAll(/cx\(([^)]*)\)/g))
    for (const s of (m[1] ?? '').matchAll(/'([^']*)'/g)) add(s[1] ?? '')
  return [...found]
}

/**
 * The longest content a variant must hold: the shared "longest" case, cut down to the variant's own
 * caps, keeping only the fields the variant shows. Required images missing from "longest" are taken
 * from "typical". This is how each variant's character caps are proved in a real browser.
 */
export function contentAtCaps(
  m: import('../src/manifest/contract.ts').BlockManifest,
  variant: string,
  longest: Record<string, unknown>,
  typical: Record<string, unknown>,
): Record<string, unknown> | null {
  const v = m.variants[variant]
  if (!v) return null
  const out: Record<string, unknown> = {}
  for (const f of v.uses as readonly string[]) {
    const value =
      longest[f] ??
      ((v.requires as readonly string[] | undefined)?.includes(f) ? typical[f] : undefined)
    if (value !== undefined) out[f] = value
  }
  for (const f of (v.requires ?? []) as readonly string[]) if (out[f] === undefined) return null
  const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n).trimEnd() : s)
  const cutRich = (r: { style: string; spans: { text: string }[] }[], n: number) => {
    const text = r.flatMap((p) => p.spans.map((s) => s.text)).join(' ')
    return text.length > n ? [{ style: 'p', spans: [{ text: cut(text, n) }] }] : r
  }
  for (const [f, cap] of Object.entries(v.caps ?? {}) as [
    string,
    number | { max?: number; parts?: Record<string, number> },
  ][]) {
    const value = out[f]
    if (value === undefined) continue
    const max = typeof cap === 'number' ? cap : cap.max
    if (typeof value === 'string' && max !== undefined) out[f] = cut(value, max)
    else if (
      Array.isArray(value) &&
      value[0] &&
      typeof value[0] === 'object' &&
      'spans' in value[0] &&
      max !== undefined
    )
      out[f] = cutRich(value as never, max)
    else if (Array.isArray(value)) {
      let list = max !== undefined ? value.slice(0, max) : value
      if (typeof cap === 'object' && cap.parts)
        list = list.map((item: Record<string, unknown>) => {
          const copy = { ...item }
          for (const [part, n] of Object.entries(cap.parts ?? {})) {
            const pv = copy[part]
            if (typeof pv === 'string') copy[part] = cut(pv, n)
            else if (Array.isArray(pv)) copy[part] = cutRich(pv as never, n)
          }
          return copy
        })
      out[f] = list
    }
  }
  return out
}
