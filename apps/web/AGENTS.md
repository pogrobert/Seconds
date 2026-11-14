# @repo/web

The builder app (TanStack Start on Cloudflare Workers).

- `src/server/env.ts` is the only file that imports `cloudflare:workers`. Everything else gets what it needs from there.
- Keys live in `.dev.vars` locally and in Worker secrets in production. Never in code or `wrangler.jsonc`.
- Run `pnpm cf-types` after changing `wrangler.jsonc` and commit `worker-configuration.d.ts`.
