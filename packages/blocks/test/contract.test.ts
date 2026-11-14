import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { FIELDS, type FieldName, SECTION_TYPES } from '@repo/spec'
import { CASES, fixtures, M0_SECTIONS, type M0Section } from '@repo/spec/fixtures'
import { type ComponentType, createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { components } from '../src/components/index.ts'
import type { BlockProps } from '../src/kit/index.tsx'
import {
  type BlockManifest,
  checkLibrary,
  checkManifest,
  eligibility,
  manifests,
} from '../src/manifest/index.ts'
import { classesIn, kitCompiler, root, testCtx } from './helpers.ts'

// The block contract, checked for every block in the library (CLAUDE.md, Rules; report 02, D9).
// A new block must pass all of this before it may enter the library.
// Blocks are found by folder and loaded one by one, so a broken block fails only its own tests.
// BLOCK=<folder> runs the checks for one block only.

const only = process.env.BLOCK
const allDirs = readdirSync(join(root, 'src/blocks'), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort()
const dirs = allDirs.filter((d) => !only || d === only)
const source = (dir: string, file: string) =>
  readFileSync(join(root, 'src/blocks', dir, file), 'utf8')

type Loaded = {
  dir: string
  m?: BlockManifest
  C?: ComponentType<BlockProps<never>>
  error?: unknown
}
const loaded: Loaded[] = await Promise.all(
  dirs.map(async (dir): Promise<Loaded> => {
    try {
      const m = (await import(`../src/blocks/${dir}/manifest.ts`)).default as BlockManifest
      const C = (await import(`../src/blocks/${dir}/component.tsx`)).default
      return { dir, m, C }
    } catch (error) {
      return { dir, error }
    }
  }),
)
const escapeHtml = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
const classExists = async () => {
  const compiler = await kitCompiler()
  return (c: string) => compiler.build([c]).includes(`.${c.replace(/[/:@.]/g, (ch) => `\\${ch}`)}`)
}

describe('library', () => {
  it.skipIf(!!only)('the registry lists exactly the block folders (run `pnpm registry`)', () => {
    const folderTypes = loaded
      .map((l) => l.m?.type)
      .filter(Boolean)
      .sort()
    expect(manifests.map((m) => m.type).sort()).toEqual(folderTypes)
    for (const m of manifests)
      expect(components[m.type], `${m.type} has no component`).toBeDefined()
  })
  it.skipIf(!!only)('every section type it covers has a version without an image', () => {
    expect(checkLibrary(loaded.flatMap((l) => (l.m ? [l.m] : [])))).toEqual([])
  })
  it('the stylesheet for any block holds every text style and width the kit can pick', async () => {
    const { siteCss } = await import('../src/build.ts')
    const css = await siteCss(['hero/standard'])
    const missing = [
      'type-display',
      'type-h2',
      'type-h3',
      'type-lead',
      'type-body',
      'type-small',
      'type-eyebrow',
      'type-button',
      'max-w-prose',
      'max-w-content',
      'max-w-wide',
    ].filter((c) => !new RegExp(`\\.${c}\\s*\\{`).test(css))
    expect(
      missing,
      'the browser check and published pages would draw these at the wrong size',
    ).toEqual([])
  })
  it('kit primitives use only kit classes', async () => {
    const exists = await classExists()
    const kit = ['primitives.tsx', 'facts.tsx']
      .map((f) => readFileSync(join(root, 'src/kit', f), 'utf8'))
      .join('\n')
    expect(classesIn(kit).filter((c) => !exists(c))).toEqual([])
  })
})

for (const { dir, m, C, error } of loaded) {
  describe(dir, () => {
    it('loads', () => expect(error, String(error)).toBeUndefined())
    if (!m || !C) return
    const tsx = source(dir, 'component.tsx')
    const manifestSrc = source(dir, 'manifest.ts')

    it('follows the manifest contract', () => {
      expect(m.type.replace('/', '-'), 'folder name must be <section>-<name>').toBe(dir)
      expect(checkManifest(m)).toEqual([])
    })
    it('is a pure function of its content', () => {
      expect(tsx).not.toMatch(/\buse[A-Z]\w*\s*\(/)
      expect(tsx).not.toMatch(/createContext|useContext/)
      expect(tsx).not.toMatch(/\bstyle=\{/)
      expect(tsx).not.toMatch(/dangerouslySetInnerHTML/)
      expect(tsx).not.toMatch(/\b(window|document|fetch|Math\.random|Date\.now|new Date)\b/)
    })
    it('imports only the kit and its own files', () => {
      for (const i of tsx.matchAll(/from '([^']+)'/g))
        expect(i[1]).toMatch(/^(\.\.\/\.\.\/kit\/index\.tsx|\.\/)/)
      for (const i of manifestSrc.matchAll(/from '([^']+)'/g))
        expect(i[1]).toBe('../../manifest/contract.ts')
    })
    it('uses theme tokens only: no literal colours, sizes or arbitrary values', () => {
      expect(tsx).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|oklch\(|\d+(px|rem|em|vw|vh)\b/)
      for (const c of classesIn(tsx)) {
        expect(c, 'arbitrary value').not.toMatch(/\[/)
        expect(c, 'dark: is a palette, not markup').not.toMatch(/(^|:)dark:/)
        expect(c, 'no !important').not.toMatch(/(^!|!$)/)
      }
    })
    it('every class exists in the kit (wiped Tailwind theme)', async () => {
      const exists = await classExists()
      expect(
        classesIn(tsx).filter((c) => !exists(c)),
        'classes that produce no CSS',
      ).toEqual([])
    })

    if (!(M0_SECTIONS as readonly string[]).includes(m.sectionType)) return
    const section = m.sectionType as M0Section
    for (const variant of Object.keys(m.variants)) {
      const shown = (m.variants[variant]?.uses ?? []) as readonly string[]
      let rendered = 0
      for (const c of CASES) {
        const f = fixtures[section][c]
        const content = f.content as Record<string, unknown>
        const e = eligibility(m, variant, content)
        it(`#${variant} / ${c}: ${e.ok ? 'renders' : `skipped (${e.reasons.join('; ')})`}`, () => {
          if (!e.ok) return
          const html = renderToStaticMarkup(
            createElement(C, {
              content: content as never,
              variant,
              ctx: testCtx(section, m.type, variant, f.context, c === 'rtl'),
            }),
          )
          rendered++
          expect(html).toContain('data-block-id="b_0000000001"')
          expect(html).toContain(`data-section="${section}"`)
          expect(html).toContain(`data-block-type="${m.type}"`)
          expect(html).toContain(`data-variant="${variant}"`)
          for (const field of shown as readonly FieldName[]) {
            if (content[field] === undefined) continue
            const kind = FIELDS[field].kind
            if (kind === 'text')
              expect(html, `${field} is not shown`).toContain(escapeHtml(content[field] as string))
            else
              expect(html, `${field} has no data-slot="${field}"`).toContain(`data-slot="${field}"`)
          }
          for (const field of Object.keys(SECTION_TYPES[section].fields))
            if (!shown.includes(field) && content[field] !== undefined)
              expect(html, `${field} is not shown by this variant but appears`).not.toContain(
                `data-slot="${field}"`,
              )
        })
      }
      it(`#${variant}: renders at least one test case`, () => expect(rendered).toBeGreaterThan(0))
    }
  })
}
