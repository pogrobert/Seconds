// Summarises tools/eval/block-log/*.json (written by the block-writing agents) as a Markdown table.
// Run: node src/block-log.ts  (from tools/eval). All figures are as the agents measured and logged them.
import { readdirSync, readFileSync } from 'node:fs'

type Entry = {
  block: string
  started: string
  finished: string
  testRuns: number
  failedRuns: number
  failures: { check: string; what: string }[]
  wanted: string[]
  notes: string
}

const dir = new URL('../block-log/', import.meta.url)
const entries: Entry[] = readdirSync(dir)
  .filter((f) => f.endsWith('.json'))
  .sort()
  .map((f) => JSON.parse(readFileSync(new URL(f, dir), 'utf8')) as Entry)

const minutes = (e: Entry) => (Date.parse(e.finished) - Date.parse(e.started)) / 60_000
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? (s[mid] ?? 0) : ((s[mid - 1] ?? 0) + (s[mid] ?? 0)) / 2
}

const rows = entries.map((e) => {
  const byCheck = new Map<string, number>()
  for (const f of e.failures) byCheck.set(f.check, (byCheck.get(f.check) ?? 0) + 1)
  const fails = [...byCheck].map(([c, n]) => `${c} ×${n}`).join(', ') || 'none'
  return `| \`${e.block}\` | ${minutes(e).toFixed(0)} | ${e.testRuns} | ${e.failedRuns} | ${fails} |`
})

const mins = entries.map(minutes)
const runs = entries.reduce((n, e) => n + e.testRuns, 0)
const failed = entries.reduce((n, e) => n + e.failedRuns, 0)
const checks = new Map<string, number>()
for (const e of entries)
  for (const f of e.failures) checks.set(f.check, (checks.get(f.check) ?? 0) + 1)

console.log(`| Block | Minutes | Test runs | Failed runs | Failures by check |
|---|---|---|---|---|
${rows.join('\n')}
| **All ${entries.length}** | median ${median(mins).toFixed(0)}, max ${Math.max(...mins).toFixed(0)} | ${runs} | ${failed} (${((100 * failed) / Math.max(runs, 1)).toFixed(0)}%) | ${[
  ...checks,
]
  .sort((a, b) => b[1] - a[1])
  .map(([c, n]) => `${c} ×${n}`)
  .join(', ')} |

Wanted from the kit or contract:
${entries.flatMap((e) => e.wanted.map((w) => `- \`${e.block}\`: ${w}`)).join('\n') || '- nothing'}`)
