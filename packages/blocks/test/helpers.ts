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
