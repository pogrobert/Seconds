// POST /api/designs {"state": SiteState} → {"designs": [{template, site}]}: the wall, every live
// design for the same site, best fit first (server/edit.ts allDesigns). No model is asked; it is
// behind the per-visitor limit all the same, since it draws every page.
import { createFileRoute } from '@tanstack/react-router'
import { allDesigns } from '../../server/edit'
import { overLimit } from '../../server/limit'
import type { SiteState } from '../../server/make-site'

export const Route = createFileRoute('/api/designs')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const limit = await overLimit(request)
        if (limit) return limit
        const body = (await request.json().catch(() => null)) as { state?: SiteState } | null
        const state = body?.state
        if (!state?.copy || !Array.isArray(state.templates))
          return Response.json({ error: 'Make a site first.' }, { status: 400 })
        try {
          return Response.json({ designs: allDesigns(state) })
        } catch (e) {
          return Response.json(
            { error: e instanceof Error ? e.message : String(e) },
            { status: 500 },
          )
        }
      },
    },
  },
})
