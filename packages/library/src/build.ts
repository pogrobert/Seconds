// Node-side: the library's stylesheet, compiled once from every class its blocks use (the same
// scanner as @repo/blocks). The build page's prepare script writes it to src/generated/library.css.
import { readdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { compile } from 'tailwindcss'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)

const candidatesIn = (source: string) => {
  const found = new Set<string>()
  // Wide enough for arbitrary variants and values: [&::-webkit-details-marker]:hidden,
  // bg-[radial-gradient(a,b)], w-[calc(100%+2rem)], *:[a]:x. Extra words cost nothing.
  for (const w of source.split(/[^\w:/.@!()[\]%&,+*>=#-]+/))
    if (/^[@a-z0-9!*[-][\w:/.@()[\]%&,+*>=#-]*$/i.test(w)) found.add(w)
  return [...found]
}

export async function libraryCss(): Promise<string> {
  const entry = join(root, 'src/styles.css')
  const compiler = await compile(readFileSync(entry, 'utf8'), {
    base: dirname(entry),
    loadStylesheet: async (id: string, base: string) => {
      const path = id.startsWith('.') ? resolve(base, id) : require.resolve(id)
      return { path, base: dirname(path), content: readFileSync(path, 'utf8') }
    },
  })
  const files = (readdirSync(join(root, 'src'), { recursive: true }) as string[])
    .filter((f) => f.endsWith('.tsx'))
    .map((f) => join(root, 'src', f))
  const candidates = [...new Set(files.flatMap((f) => candidatesIn(readFileSync(f, 'utf8'))))]
  return compiler.build(candidates)
}
