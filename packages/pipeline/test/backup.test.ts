import { describe, expect, it } from 'vitest'
import {
  type Answer,
  type DecisionPort,
  openrouterDecisions,
  type Question,
  typesafeDecisions,
  withBackup,
} from '../src/decide.ts'

const qs: Question[] = [
  { kind: 'bool', id: 'b', prompt: 'Is it a café?' },
  {
    kind: 'choice',
    id: 'c',
    prompt: 'Which colour?',
    options: [
      { key: 'navy', text: 'Navy' },
      { key: 'rose', text: 'Rose' },
    ],
  },
]

/** A port that answers every question it is asked with a fixed answer, and counts its calls. */
function fixed(id: string, make: (q: Question) => Answer) {
  const asked: string[][] = []
  const port: DecisionPort = {
    id,
    model: id,
    async decide(_s, questions) {
      asked.push(questions.map((q) => q.id))
      return { answers: new Map(questions.map((q) => [q.id, make(q)])), calls: [] }
    },
  }
  return { port, asked }
}

const missing = (q: Question): Answer => ({ kind: 'missing', id: q.id, reason: 'error' })
const answered = (q: Question): Answer =>
  q.kind === 'bool'
    ? { kind: 'bool', id: q.id, pTrue: 0.9 }
    : { kind: 'choice', id: q.id, top: 'rose', dist: { rose: 1 }, pTop: 1, margin: 1 }

describe('withBackup', () => {
  it('does not call the backup when Jev answers everything', async () => {
    const jev = fixed('jev', answered)
    const backup = fixed('backup', answered)
    await withBackup(jev.port, backup.port).decide({}, qs)
    expect(backup.asked).toEqual([])
  })

  it('asks the backup only what Jev left unanswered', async () => {
    const jev = fixed('jev', (q) => (q.id === 'b' ? answered(q) : missing(q)))
    const backup = fixed('backup', answered)
    const r = await withBackup(jev.port, backup.port).decide({}, qs)
    expect(backup.asked).toEqual([['c']])
    expect(r.answers.get('c')).toMatchObject({ kind: 'choice', top: 'rose' })
  })

  it('takes over everything when Jev is down (HTTP 503)', async () => {
    const down = typesafeDecisions({
      apiKey: 'x',
      fetch: async () => new Response('down', { status: 503 }),
    })
    const backup = fixed('backup', answered)
    const r = await withBackup(down, backup.port).decide({}, qs)
    expect(backup.asked).toEqual([['b', 'c']])
    expect(r.answers.get('b')).toMatchObject({ kind: 'bool', pTrue: 0.9 })
  })
})

describe('openrouterDecisions', () => {
  it('reads probabilities and ranked options back into answers', async () => {
    const port = openrouterDecisions({
      apiKey: 'x',
      fetch: async () =>
        Response.json({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  q001: { p: 0.8 },
                  q002: {
                    ranked: [
                      { key: 'k2', p: 0.7 },
                      { key: 'k1', p: 0.2 },
                    ],
                  },
                }),
              },
            },
          ],
          usage: { cost: 0.0001 },
        }),
    })
    const r = await port.decide({}, qs)
    expect(r.answers.get('b')).toEqual({ kind: 'bool', id: 'b', pTrue: 0.8 })
    expect(r.answers.get('c')).toMatchObject({ kind: 'choice', top: 'rose', pTop: 0.7 })
  })

  it('leaves questions missing when the call fails', async () => {
    const port = openrouterDecisions({
      apiKey: 'x',
      fetch: async () => new Response('no', { status: 500 }),
    })
    const r = await port.decide({}, qs)
    expect(r.answers.get('b')).toMatchObject({ kind: 'missing' })
  })
})
