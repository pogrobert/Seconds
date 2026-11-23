// Every template's page, drawn with the test businesses (full, minimal, right-to-left) with no
// extra sections and with all of them, must stay the same HTML: a change to shared code or to a
// template that alters a page shows up here. The pages are compared by a short fingerprint
// (test/template-hashes.json). After a change you mean, run with UPDATE_HASHES=1; the drawn pages
// are written to test/.out/ (ignored by git) to compare by eye or with diff.
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { type Extra, TEMPLATES } from '../src/index.ts'
import { full, minimal, rtl } from './fixtures.ts'

const ALL: Extra[] = ['statement', 'reasons', 'audience', 'steps', 'gallery', 'faq']
const CASES = [
  ['full', full, []],
  ['full-all', full, ALL],
  ['minimal', minimal, []],
  ['minimal-all', minimal, ALL],
  ['rtl', rtl, []],
  ['rtl-all', rtl, ALL],
] as const

const file = new URL('./template-hashes.json', import.meta.url)
const out = new URL('./.out/', import.meta.url)
const known: Record<string, string> = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {}
const update = process.env.UPDATE_HASHES === '1'
const now: Record<string, string> = {}

describe('templates draw the same pages', () => {
  for (const tpl of TEMPLATES)
    for (const [name, content, extras] of CASES)
      it(`${tpl.id} ${name}`, () => {
        const html = renderToStaticMarkup(<tpl.Page c={content} extras={[...extras]} />) + tpl.css
        const key = `${tpl.id}/${name}`
        now[key] = createHash('sha256').update(html).digest('hex').slice(0, 16)
        mkdirSync(out, { recursive: true })
        writeFileSync(new URL(`${tpl.id}-${name}.html`, out), html)
        if (!update) expect(now[key], key).toBe(known[key])
      })
  it('writes the fingerprints when asked', () => {
    if (update) writeFileSync(file, `${JSON.stringify(now, null, 2)}\n`)
  })
})
