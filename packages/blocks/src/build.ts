// Node-side build helpers: the stylesheet for a set of blocks. Not for Workers (it reads files);
// published sites will use candidate lists precomputed at library build (report 02, D8).
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { compile } from 'tailwindcss'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)

/**
 * Every word in every string literal of a source file, as Tailwind's scanner would collect them.
 * Over-inclusive on purpose: words that are not classes produce no CSS.
 */
export function candidatesIn(source: string): string[] {
  const found = new Set<string>()
  for (const m of source.matchAll(/'([^'\n]*)'|"([^"\n]*)"|`([^`$]*)`/g))
    for (const w of (m[1] ?? m[2] ?? m[3] ?? '').split(/\s+/))
      if (/^[@a-z0-9!-][\w:/.@-]*$/i.test(w)) found.add(w)
  return [...found]
}

/** Folder of a block type: "hero/standard" → src/blocks/hero-standard. */
const folderOf = (type: string) => join(root, 'src/blocks', type.replace('/', '-'))

/** The stylesheet for a page that uses these block types: kit, the blocks' classes, then the theme. */
export async function siteCss(types: readonly string[], themeCss?: string): Promise<string> {
  const kitPath = join(root, 'src/kit/kit.css')
  const compiler = await compile(readFileSync(kitPath, 'utf8'), {
    base: dirname(kitPath),
    loadStylesheet: async (id: string, base: string) => {
      const path = id.startsWith('.') ? resolve(base, id) : require.resolve(id)
      return { path, base: dirname(path), content: readFileSync(path, 'utf8') }
    },
  })
  const files = [
    ...['core.ts', 'primitives.tsx', 'facts.tsx'].map((f) => join(root, 'src/kit', f)),
    ...types.map((t) => join(folderOf(t), 'component.tsx')),
  ].filter((f) => existsSync(f))
  const candidates = [...new Set(files.flatMap((f) => candidatesIn(readFileSync(f, 'utf8'))))]
  return (
    compiler.build(candidates) +
    (themeCss ?? readFileSync(join(root, 'src/kit/draft-theme.css'), 'utf8'))
  )
}
