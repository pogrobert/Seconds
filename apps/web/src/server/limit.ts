// Limits for the public link (2026-11-23): the routes that spend model credit allow a few calls a
// minute per visitor, and the bench's own routes answer only where BENCH=1 (.dev.vars).
import { getEnv } from './env'

type Limiter = { limit(o: { key: string }): Promise<{ success: boolean }> }

/** Null when the visitor may go on; otherwise the answer to send instead. */
export async function overLimit(request: Request): Promise<Response | null> {
  const limiter = (getEnv() as unknown as { BUILD_LIMIT?: Limiter }).BUILD_LIMIT
  if (!limiter) return null
  const key = request.headers.get('cf-connecting-ip') ?? 'local'
  const { success } = await limiter.limit({ key })
  return success
    ? null
    : Response.json(
        { error: 'That is a lot of sites in one minute. Wait a moment and try again.' },
        { status: 429 },
      )
}

/** The bench's routes (tools/bench) exist only on a developer's machine (BENCH=1). */
export function benchOnly(): Response | null {
  return (getEnv() as unknown as { BENCH?: string }).BENCH === '1'
    ? null
    : new Response('Not found', { status: 404 })
}
