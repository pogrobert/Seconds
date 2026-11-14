// Renders the code-default site for each kind of business (M0 arm B) to tools/eval/out/samples/,
// in the draft placeholder theme. Run: pnpm --filter @repo/eval samples.
// Vitest is only the runner here, because it compiles TSX.
import { mkdirSync, writeFileSync } from 'node:fs'
import { expect, it } from 'vitest'
import { KINDS } from '../src/businesses.ts'
import { renderSample } from '../src/render-sample.ts'

const out = new URL('../out/samples/', import.meta.url)
mkdirSync(out, { recursive: true })

for (const kind of KINDS) {
  it(`renders the ${kind} default site`, async () => {
    const r = await renderSample(kind)
    expect(r.problems).toEqual([])
    writeFileSync(new URL(`${kind}.html`, out), r.html)
    writeFileSync(new URL(`${kind}.spec.json`, out), JSON.stringify(r.spec, null, 2))
    expect(r.notes).toEqual([])
  })
}
