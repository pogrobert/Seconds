import { describe, expect, it } from 'vitest'
import { FIELDS, type FieldLimits, type FieldName } from '../src/fields.ts'
import { CASES, fixtures, M0_SECTIONS } from '../src/fixtures/index.ts'
import { Business, Collection } from '../src/index.ts'
import {
  contentSchema,
  RESERVED_SECTION_TYPES,
  SECTION_TYPE_NAMES,
  SECTION_TYPES,
} from '../src/section-types.ts'
import { type RichText, richTextLength } from '../src/values.ts'

describe('section types', () => {
  it('has the 21 accepted types (decision 0001)', () => {
    expect(SECTION_TYPE_NAMES).toHaveLength(21)
    for (const r of RESERVED_SECTION_TYPES) expect(SECTION_TYPE_NAMES).not.toContain(r)
  })

  for (const name of SECTION_TYPE_NAMES) {
    const def = SECTION_TYPES[name]
    it(`${name}: uses only global fields, with every limit they need`, () => {
      for (const [field, limits] of Object.entries(def.fields) as [FieldName, FieldLimits][]) {
        expect(FIELDS[field], `${name}.${field} is not a global field`).toBeDefined()
        for (const need of FIELDS[field].needs)
          expect(limits[need], `${name}.${field} needs ${need}`).toBeDefined()
      }
      expect(
        Object.values(def.fields).some((l) => (l as FieldLimits).required) ||
          name === 'footer' ||
          name === 'contact',
      ).toBe(true)
      expect(def.label.length).toBeLessThanOrEqual(24)
      expect(def.purpose.split(/\s+/).length).toBeLessThanOrEqual(25)
    })
  }
})

describe('test content', () => {
  for (const section of M0_SECTIONS) {
    for (const c of CASES) {
      it(`${section} / ${c} is valid`, () => {
        const f = fixtures[section][c]
        const r = contentSchema(section).safeParse(f.content)
        expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
        expect(Business.safeParse(f.context.business).success).toBe(true)
        for (const col of Object.values(f.context.collections)) {
          const cr = Collection.safeParse(col)
          expect(cr.success, JSON.stringify(cr.error?.issues.slice(0, 3))).toBe(true)
        }
      })
    }
    it(`${section} / longest fills every text field to its limit`, () => {
      const content = fixtures[section].longest.content as Record<string, unknown>
      for (const [field, limits] of Object.entries(SECTION_TYPES[section].fields) as [
        FieldName,
        FieldLimits,
      ][]) {
        const kind = FIELDS[field].kind
        if (kind === 'text')
          expect((content[field] as string).length, `${section}.${field}`).toBe(limits.max)
        if (kind === 'richText')
          expect(richTextLength(content[field] as RichText), `${section}.${field}`).toBe(limits.max)
        if (['items', 'gallery', 'nav'].includes(kind))
          expect((content[field] as unknown[]).length, `${section}.${field}`).toBe(limits.max)
      }
    })
  }
})
