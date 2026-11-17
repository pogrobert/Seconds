// The build page's server function. The build itself lives in make-site.ts: this file is also
// loaded in the browser (as a call to the server), so it must import nothing server-only besides
// what the handler alone uses.
import { createServerFn } from '@tanstack/react-start'
import { build, type PhotoJob, sitePhotos } from './make-site'

export type { BuildResult, BuiltSite, PhotoJob, PhotoResult } from './make-site'

export const buildSite = createServerFn({ method: 'POST' })
  .validator((d: { messages: string[] }) => {
    const messages = (Array.isArray(d?.messages) ? d.messages : []).map(String).filter(Boolean)
    if (!messages.length) throw new Error('Describe the business first.')
    return { messages: messages.slice(-12).map((m) => m.slice(0, 1500)) }
  })
  .handler(({ data }) => build(data.messages))

/** The photo step, called by the build page once the page is showing. */
export const findSitePhotos = createServerFn({ method: 'POST' })
  .validator((d: PhotoJob) => {
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
    }
  })
  .handler(({ data }) => sitePhotos(data))
