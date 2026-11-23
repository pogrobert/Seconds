// POST /api/photos {PhotoJob} → PhotoResult as JSON: the photo step on its own. The build page
// calls it when the photos found during the build did not arrive; the bench calls it too.
import { createFileRoute } from '@tanstack/react-router'
import { ART_STRENGTHS, ART_STYLES } from '../../server/art'
import { overLimit } from '../../server/limit'
import { type PhotoJob, sitePhotos } from '../../server/make-site'

/** Only the fields a photo job has, each cut to size. */
function clean(d: PhotoJob): PhotoJob {
  const str = (v: unknown, max: number) => String(v ?? '').slice(0, max)
  return {
    queries: {
      place: str(d?.queries?.place, 80),
      people: str(d?.queries?.people, 80),
      detail: str(d?.queries?.detail, 80),
    },
    about: {
      name: str(d?.about?.name, 140),
      kind: str(d?.about?.kind, 60),
      town: str(d?.about?.town, 60),
    },
    seed: str(d?.seed, 40),
    art: {
      style: (ART_STYLES as readonly string[]).includes(d?.art?.style) ? d.art.style : 'underpaint',
      strength: d?.art?.strength in ART_STRENGTHS ? d.art.strength : 'muted',
    },
    ...(Array.isArray(d?.avoid) ? { avoid: d.avoid.slice(0, 40).map((x) => str(x, 40)) } : {}),
    ...(d?.none ? { none: true } : {}),
  }
}

export const Route = createFileRoute('/api/photos')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const limit = await overLimit(request)
        if (limit) return limit
        const job = (await request.json().catch(() => null)) as PhotoJob | null
        if (!job?.queries || !job.about)
          return Response.json({ error: 'not a photo job' }, { status: 400 })
        return Response.json(await sitePhotos(clean(job)))
      },
    },
  },
})
