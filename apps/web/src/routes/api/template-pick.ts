// POST /api/template-pick {words} → Jev's ranking of every template, drafts included, with its
// probabilities. For the coverage test (docs/m0/25-template-plan.md): does every kind of
// organisation get a template that fits? Same question as the build's (make-site.ts pickParts).
import { TEMPLATES } from '@repo/library'
import { typesafeDecisions } from '@repo/pipeline'
import { createFileRoute } from '@tanstack/react-router'
import { getEnv } from '../../server/env'

export const Route = createFileRoute('/api/template-pick')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const b = (await request.json().catch(() => null)) as { words?: string } | null
        const key = getEnv().TYPESAFE_API_KEY
        if (!b?.words || !key) return Response.json({ error: 'words and a key' }, { status: 400 })
        const res = await typesafeDecisions({ apiKey: key }).decide({ brief: b.words }, [
          {
            kind: 'choice',
            id: 'template',
            prompt:
              "Which design for this organisation's whole website would its owner and its visitors like best?",
            options: TEMPLATES.map((t) => ({ key: t.id, text: t.text })),
          },
        ])
        const a = res.answers.get('template')
        const dist = a?.kind === 'choice' ? (a.dist ?? { [a.top]: 1 }) : {}
        const ranked = TEMPLATES.map((t) => ({ id: t.id, p: dist[t.id] ?? 0 })).sort(
          (x, y) => y.p - x.p,
        )
        return Response.json({
          ranked,
          costUsd: res.calls.reduce((s, c) => s + (c.costUsd ?? 0), 0),
        })
      },
    },
  },
})
