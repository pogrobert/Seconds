// The build page's server function. The build itself lives in make-site.ts: this file is also
// loaded in the browser (as a call to the server), so it must import nothing server-only besides
// what the handler alone uses.
import { createServerFn } from '@tanstack/react-start'
import { build } from './make-site'

export type { BuildResult, BuiltSite } from './make-site'

export const buildSite = createServerFn({ method: 'POST' })
  .validator((d: { messages: string[] }) => {
    const messages = (Array.isArray(d?.messages) ? d.messages : []).map(String).filter(Boolean)
    if (!messages.length) throw new Error('Describe the business first.')
    return { messages: messages.slice(-12).map((m) => m.slice(0, 1500)) }
  })
  .handler(({ data }) => build(data.messages))
