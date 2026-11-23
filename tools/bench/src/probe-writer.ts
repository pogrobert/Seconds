// What the writer itself returns for an edit, before edit.ts checks it: every field it changed.
// For telling a cautious writer from a check that undoes its change.
//   node --env-file=../../apps/web/.dev.vars src/probe-writer.ts "<brief>" "<edit>" [runs]
import { type SiteCopy, writeSiteCopy } from '../../../packages/pipeline/src/site-text.ts'

const [brief = '', request = '', runs = '2'] = process.argv.slice(2)
const apiKey = process.env.OPENROUTER_API_KEY ?? ''
const first = await writeSiteCopy({ apiKey, words: brief })
if (!first.copy) throw new Error(first.problems.join('; '))
const before: SiteCopy = first.copy
console.log(`known=${before.known} unclear=${before.unclear}`)
for (let i = 0; i < Number(runs); i++) {
  const w = await writeSiteCopy({
    apiKey,
    words: `${brief}\n${request}`,
    edit: { copy: before, request },
  })
  console.log(`\nrun ${i + 1} (${w.ms} ms) ${w.problems.join('; ')}`)
  for (const k of Object.keys(w.copy ?? {}) as (keyof SiteCopy)[]) {
    if (k === 'more') continue
    const a = JSON.stringify(before[k])
    const b = JSON.stringify(w.copy?.[k])
    if (a !== b) console.log(`  ${k}: ${b.slice(0, 400)}`)
  }
}
