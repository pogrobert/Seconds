# @repo/web

The builder app (TanStack Start on Cloudflare Workers).

- `src/server/env.ts` is the only file that imports `cloudflare:workers`. Everything else gets what it needs from there.
- Keys live in `.dev.vars` locally and in Worker secrets in production. Never in code or `wrangler.jsonc`.
- Run `pnpm cf-types` after changing `wrangler.jsonc` and commit `worker-configuration.d.ts`.

## The build page (`/`)

- Chat on the left, the live site on the right. Each message rebuilds the site from everything the owner has said: the decision model picks the kind of business and the suggested direction, the text model writes the words, and code draws the site in every direction (`src/server/build.ts`).
- Facts and photos are stand-ins: the sample business of the chosen kind (`@repo/eval`).
- `pnpm dev` first runs `scripts/prepare.ts`, which compiles every block's stylesheet into `src/generated/` and copies the stock photos into `public/photos/`. Both are git-ignored.
- Keys: `.dev.vars` is a link to the project's `.env`, and is git-ignored. Without keys, stand-ins answer, and the reply shows which models were used.
