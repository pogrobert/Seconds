// GET /api/photo/:id?u=source → one chosen photo as plain bytes (server/photo-store.ts). The build
// page fetches each photo here as its link arrives. Not behind the per-visitor limit: it spends no
// model credit, and a photo already chosen is served from memory or the cache.
import { createFileRoute } from '@tanstack/react-router'
import { servePhoto } from '../../server/photo-store'

export const Route = createFileRoute('/api/photo/$id')({
  server: {
    handlers: {
      GET: ({ request, params }) =>
        servePhoto(params.id, new URL(request.url).searchParams.get('u')),
    },
  },
})
