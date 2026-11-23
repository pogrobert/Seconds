// POST /api/build {"messages": ["…"]} → BuildResult as JSON. For the benchmark harness
// (tools/bench), so it measures the real runtime; the build page uses the server function.
import { createFileRoute } from '@tanstack/react-router'
import { benchOnly } from '../../server/limit'
import { build } from '../../server/make-site'

export const Route = createFileRoute('/api/build')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const hidden = benchOnly()
        if (hidden) return hidden
        const body = (await request.json().catch(() => null)) as { messages?: unknown } | null
        const messages = (Array.isArray(body?.messages) ? body.messages : [])
          .map(String)
          .filter(Boolean)
          .slice(-12)
          .map((m) => m.slice(0, 1500))
        if (!messages.length) return Response.json({ error: 'messages is empty' }, { status: 400 })
        return Response.json(await build(messages))
      },
    },
  },
})
