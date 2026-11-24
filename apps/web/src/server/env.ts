// The ONLY file that imports from Cloudflare. Everything else asks this file.
import { env } from 'cloudflare:workers'

/**
 * Keys that are optional and not yet in every .dev.vars, so not in the generated Env type: film
 * and TV stills (TMDB) and game screenshots (IGDB, through a Twitch app), 2026-11-24.
 */
export type Keys = Env & {
  TMDB_TOKEN?: string
  TWITCH_CLIENT_ID?: string
  TWITCH_CLIENT_SECRET?: string
}

export function getEnv(): Keys {
  return env as Keys
}
