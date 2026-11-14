// The ONLY file that imports from Cloudflare. Everything else asks this file.
import { env } from 'cloudflare:workers'

export function getEnv(): Env {
  return env
}
