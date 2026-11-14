# @repo/spec

Types, Zod schemas and operations for the site spec, plus the one list of content fields and the section types.

- Pure: no React, no `cloudflare:*`, no `node:*`. Biome enforces this.
- The field list and section types are only ever added to. Changing or removing one needs a spec migration.
- Every spec carries `specVersion`.
