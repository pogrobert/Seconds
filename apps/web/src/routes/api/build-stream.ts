// POST /api/build-stream {"messages": [...]} → the build as it happens, one JSON object a line:
// {"type":"step","step":"choices"|"words"|"check","ms":…} as each part finishes, then
// {"type":"result","result":BuildResult}, then {"type":"photos","photos":PhotoResult|null} (the
// photo step starts early on the server, docs/m0/26-speed.md), or {"type":"error","message":…}. The build page reads it
// to show live progress; /api/build (the bench) and the server function still answer once.
import { createFileRoute } from '@tanstack/react-router'
import { edit } from '../../server/edit'
import { overLimit } from '../../server/limit'
import { build, type SiteState } from '../../server/make-site'

export const Route = createFileRoute('/api/build-stream')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const limit = await overLimit(request)
        if (limit) return limit
        const body = (await request.json().catch(() => null)) as {
          messages?: unknown
          /** The site so far: the last message is then an edit of it (docs/m0/27-editing.md). */
          state?: SiteState | null
        } | null
        const messages = (Array.isArray(body?.messages) ? body.messages : [])
          .map(String)
          .filter(Boolean)
          .slice(-12)
          .map((m) => m.slice(0, 1500))
        if (!messages.length)
          return Response.json({ error: 'Describe the site first.' }, { status: 400 })
        const enc = new TextEncoder()
        const stream = new ReadableStream({
          async start(c) {
            const send = (o: unknown) => c.enqueue(enc.encode(`${JSON.stringify(o)}\n`))
            try {
              // The photos may be found before or after the page; they are sent after it.
              let photos: (p: unknown) => void = () => {}
              const photosReady = new Promise((ok) => {
                photos = ok
              })
              const step = (s: unknown) => send({ type: 'step', ...(s as object) })
              const edited =
                body?.state?.copy && messages.length > 1
                  ? await edit(body.state, messages[messages.length - 1] ?? '', step, (p) =>
                      photos(p),
                    )
                  : null
              if (edited && 'undo' in edited) {
                send({ type: 'result', result: { undo: true } })
                c.close()
                return
              }
              const result =
                edited && !edited.restart
                  ? edited.result
                  : await build(messages, step, { onPhotos: (p) => photos(p) })
              send({ type: 'result', result })
              if (result.photoJob) send({ type: 'photos', photos: await photosReady })
            } catch (e) {
              send({ type: 'error', message: e instanceof Error ? e.message : String(e) })
            }
            c.close()
          },
        })
        return new Response(stream, {
          headers: {
            'content-type': 'application/x-ndjson; charset=utf-8',
            'cache-control': 'no-store',
          },
        })
      },
    },
  },
})
