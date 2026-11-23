// Ask Jev only the edit's "what does the request ask for" questions (edit.ts ASKS), for requests
// that went wrong, and print each score: cheaper than a full edit, and shows why it went wrong.
//   node --env-file=../../apps/web/.dev.vars src/probe-edit.ts
import { readFileSync } from 'node:fs'
import { typesafeDecisions } from '../../../packages/pipeline/src/decide.ts'

const src = readFileSync(new URL('../../../apps/web/src/server/edit.ts', import.meta.url), 'utf8')
const block = src.slice(
  src.indexOf('const ASKS = {'),
  src.indexOf('} as const', src.indexOf('const ASKS = {')),
)
const asks: [string, string][] = []
for (const m of block.matchAll(/^\s+(\w+):\s*\n?\s*(['"])([\s\S]*?)\2,\n/gm))
  asks.push([m[1], m[3]])
for (const [id, what] of Object.entries(
  JSON.parse(process.env.EXTRA ?? '{}') as Record<string, string>,
))
  asks.push([id, what])
const cases = JSON.parse(process.argv[2] ?? '[]') as { site: string; request: string }[]
const port = typesafeDecisions({ apiKey: process.env.TYPESAFE_API_KEY ?? '' })
const only = (process.env.ONLY ?? '').split(',').filter(Boolean)
for (const c of cases) {
  const r = await port.decide(
    { owner_words: process.env.OWNER ?? '', website: c.site, request: c.request },
    asks
      .filter(([id]) => !only.length || only.includes(id))
      .map(([id, what]) => ({
        kind: 'bool' as const,
        id,
        prompt: `An organisation's owner has a website (\`website\`) and now sends \`request\`. Does the request ${what}?`,
      })),
  )
  const row = [...r.answers.entries()].map(
    ([id, a]) => `${id} ${a.kind === 'bool' ? a.pTrue.toFixed(2) : a.kind}`,
  )
  console.log(`${c.request}\n  ${row.join('  ')}`)
}
