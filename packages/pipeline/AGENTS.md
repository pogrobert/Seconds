# @repo/pipeline

`generate()` and the two model interfaces: one for decisions, one for text.

- Pure: no React, no `cloudflare:*`, no `node:*`. Models are passed in.
- Import `@repo/blocks/manifest` only, never `@repo/blocks/components`.
- The decision model is asked about attributes; code picks the variant. Fact fields never reach the text model.
