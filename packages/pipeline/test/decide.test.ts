import { describe, expect, it } from 'vitest'
import { randomDecisions, typesafeDecisions } from '../src/decide.ts'

describe('score questions', () => {
  it('are sent as System One scores and read back per level', async () => {
    let sent: unknown = null
    const fakeFetch = (async (_url: string, init: { body: string }) => {
      sent = JSON.parse(init.body)
      return new Response(
        JSON.stringify({
          model: 'jev-1.14.0',
          answers: {
            q001: { type: 'score', score: 1.4, probabilities: { 0: 0.1, 1: 0.4, 2: 0.5 } },
          },
          usage: { input_tokens: 100 },
        }),
        { status: 200 },
      )
    }) as unknown as typeof fetch
    const port = typesafeDecisions({ apiKey: 'test', fetch: fakeFetch })
    const r = await port.decide({ brief: 'x' }, [
      { kind: 'score', id: 'energy', prompt: 'How loud?', levels: ['quiet', 'mid', 'loud'] },
    ])
    expect((sent as { questions: Record<string, unknown> }).questions.q001).toEqual({
      type: 'score',
      instructions: 'How loud?',
      criteria: ['quiet', 'mid', 'loud'],
    })
    expect(r.answers.get('energy')).toEqual({
      kind: 'score',
      id: 'energy',
      score: 1.4,
      dist: [0.1, 0.4, 0.5],
    })
  })

  it('get one level from the random stand-in', async () => {
    const r = await randomDecisions('s').decide({}, [
      { kind: 'score', id: 'e', prompt: 'p', levels: ['a', 'b', 'c', 'd'] },
    ])
    const a = r.answers.get('e')
    expect(a?.kind).toBe('score')
    if (a?.kind === 'score') expect(a.dist?.reduce((x, y) => x + y, 0)).toBe(1)
  })
})
