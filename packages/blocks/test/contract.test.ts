import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { FIELDS, type FieldName, SECTION_TYPES } from '@repo/spec'
import { CASES, fixtures, M0_SECTIONS, type M0Section } from '@repo/spec/fixtures'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { components } from '../src/components/index.ts'
import { checkLibrary, checkManifest, eligibility, manifests } from '../src/manifest/index.ts'
import { classesIn, kitCompiler, root, testCtx } from './helpers.ts'

// The block contract, checked for every block in the library (CLAUDE.md, Rules; report 02, D9).
// A new block must pass all of this before it may enter the library.

const blockDirs = readdirSync(join(root, 'src/blocks'))
const source = (dir: string, file: string) =>
  readFileSync(join(root, 'src/blocks', dir, file), 'utf8')

describe('manifests', () => {
  it('every block is registered once, with a component', () => {
    expect(manifests.length).toBe(blockDirs.length)
    for (const m of manifests)
      expect(components[m.type], `${m.type} has no component`).toBeDefined()
  })
  for (const m of manifests) {
    it(`${m.type}: follows the contract`, () => expect(checkManifest(m)).toEqual([]))
  }
  it('the library has a no-image version of every section type it covers', () => {
    expect(checkLibrary(manifests)).toEqual([])
  })
})

describe('block source', () => {
  for (const dir of blockDirs) {
    const tsx = source(dir, 'component.tsx')
    const manifest = source(dir, 'manifest.ts')
    it(`${dir}: is a pure function of its content`, () => {
      expect(tsx).not.toMatch(/\buse[A-Z]\w*\s*\(/) // no hooks
      expect(tsx).not.toMatch(/createContext|useContext/)
      expect(tsx).not.toMatch(/\bstyle=\{/)
      expect(tsx).not.toMatch(/dangerouslySetInnerHTML/)
      expect(tsx).not.toMatch(/\b(window|document|fetch|Math\.random|Date\.now)\b/)
    })
    it(`${dir}: imports only the kit and its own files`, () => {
      for (const m of tsx.matchAll(/from '([^']+)'/g))
        expect(m[1]).toMatch(/^(\.\.\/\.\.\/kit\/index\.tsx|\.\/)/)
      for (const m of manifest.matchAll(/from '([^']+)'/g))
        expect(m[1]).toBe('../../manifest/contract.ts')
    })
    it(`${dir}: uses theme tokens only (no literal colours, sizes or arbitrary values)`, () => {
      expect(tsx).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|oklch\(|\d+(px|rem|em)\b/)
      for (const c of classesIn(tsx)) {
        expect(c, 'arbitrary value').not.toMatch(/\[/)
        expect(c, 'dark: is a palette, not markup').not.toMatch(/(^|:)dark:/)
        expect(c, 'no !important').not.toMatch(/(^!|!$)/)
      }
    })
    it(`${dir}: every class exists in the kit (wiped Tailwind theme)`, async () => {
      const compiler = await kitCompiler()
      const unknown = classesIn(tsx).filter((c) => {
        const css = compiler.build([c])
        return !css.includes(`.${c.replace(/[/:@.]/g, (ch) => `\\${ch}`)}`)
      })
      expect(unknown, 'classes that produce no CSS').toEqual([])
    })
  }
  it('kit primitives use only kit classes too', async () => {
    const compiler = await kitCompiler()
    const kit = readFileSync(join(root, 'src/kit/index.tsx'), 'utf8')
    const unknown = classesIn(kit).filter(
      (c) => !compiler.build([c]).includes(`.${c.replace(/[/:@.]/g, (ch) => `\\${ch}`)}`),
    )
    expect(unknown).toEqual([])
  })
})

describe('rendering the shared test content', () => {
  for (const m of manifests) {
    if (!(M0_SECTIONS as readonly string[]).includes(m.sectionType)) continue
    const section = m.sectionType as M0Section
    for (const variant of Object.keys(m.variants)) {
      const shown = (m.variants[variant]?.uses ?? []) as readonly string[]
      let rendered = 0
      for (const c of CASES) {
        const f = fixtures[section][c]
        const content = f.content as Record<string, unknown>
        const e = eligibility(m, variant, content)
        it(`${m.type}#${variant} / ${c}: ${e.ok ? 'renders' : `skipped (${e.reasons.join('; ')})`}`, () => {
          if (!e.ok) return
          const Component = components[m.type]
          if (!Component) throw new Error('no component')
          const html = renderToStaticMarkup(
            createElement(Component, {
              content: content as never,
              variant,
              ctx: testCtx(section, m.type, variant, f.context),
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
            if (['cta', 'richText', 'image', 'gallery', 'proof'].includes(kind))
              expect(html, `${field} has no data-slot`).toContain(`data-slot="${field}"`)
          }
          for (const field of Object.keys(SECTION_TYPES[section].fields))
            if (
              !shown.includes(field) &&
              content[field] !== undefined &&
              FIELDS[field as FieldName].kind === 'text'
            )
              expect(html, `${field} is hidden by this variant but appears`).not.toContain(
                `data-slot="${field}"`,
              )
        })
      }
      it(`${m.type}#${variant}: renders at least one test case`, () =>
        expect(rendered).toBeGreaterThan(0))
    }
  }
})

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
