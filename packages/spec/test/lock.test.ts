import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { FIELDS } from '../src/fields.ts'
import { SECTION_TYPES } from '../src/section-types.ts'

// Saved sites depend on the section types. Only additions are allowed (decision 0001).
// A change that fails here needs a spec migration and Robert's approval, not a lock update.
type Limits = Record<string, unknown> & {
  required?: boolean
  max?: number
  min?: number
  maxChildren?: number
}
const lock = JSON.parse(
  readFileSync(new URL('../section-types.lock.json', import.meta.url), 'utf8'),
) as {
  fields: Record<string, { kind: string; writer: string }>
  sectionTypes: Record<string, { fields: Record<string, Limits> }>
}

describe('accepted contract (section-types.lock.json)', () => {
  it('keeps every field with the same kind and writer', () => {
    for (const [name, f] of Object.entries(lock.fields)) {
      const now = FIELDS[name as keyof typeof FIELDS]
      expect(now, `field ${name} was removed`).toBeDefined()
      expect({ kind: now.kind, writer: now.writer }).toEqual(f)
    }
  })
  it('keeps every section type, field and limit, and never tightens one', () => {
    const current = SECTION_TYPES as unknown as Record<string, { fields: Record<string, Limits> }>
    for (const [type, def] of Object.entries(lock.sectionTypes)) {
      expect(current[type], `section type ${type} was removed`).toBeDefined()
      for (const [field, was] of Object.entries(def.fields)) {
        const now = current[type]?.fields[field]
        expect(now, `${type}.${field} was removed`).toBeDefined()
        if (!now) continue
        if (!was.required)
          expect(now.required ?? false, `${type}.${field} became required`).toBe(false)
        for (const k of ['max', 'maxChildren'] as const)
          if (was[k] !== undefined)
            expect(now[k] ?? 0, `${type}.${field}.${k} was lowered`).toBeGreaterThanOrEqual(
              was[k] as number,
            )
        if (was.min !== undefined)
          expect(now.min ?? 0, `${type}.${field}.min was raised`).toBeLessThanOrEqual(was.min)
      }
    }
  })
})
