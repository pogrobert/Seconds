// POST /api/photos {PhotoJob} → PhotoResult as JSON: the photo step, for the benchmark harness
// (tools/bench); the build page uses the server function.
import { createFileRoute } from '@tanstack/react-router'
import { type PhotoJob, sitePhotos } from '../../server/make-site'

export const Route = createFileRoute('/api/photos')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const job = (await request.json().catch(() => null)) as PhotoJob | null
        if (!job?.queries || !job.about)
          return Response.json({ error: 'not a photo job' }, { status: 400 })
        return Response.json(await sitePhotos(job))
      },
    },
  },
})
