# @repo/blocks

Block manifests (data only) and block components (pure React functions).

- `src/manifest/` is pure data: no React. The pipeline imports it.
- `src/components/`: pure functions, no hooks, no state, theme tokens only, container queries only.
- Every block implements one section type and never adds a field of its own. See the block contract in CLAUDE.md.
