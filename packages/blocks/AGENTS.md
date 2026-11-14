# @repo/blocks

The block library: manifests (data), components (pure React functions), and the kit they are built from.

## Adding a block

1. Pick the section type it implements from `@repo/spec` (`SECTION_TYPES`). Its fields and limits are fixed: a block can never add a field. If a design needs a field that does not exist, stop and ask; it is a change to decision 0001.
2. Create `src/blocks/<section>-<name>/` with two files:
   - `manifest.ts`: `defineBlock({ type: '<section>/<name>', sectionType, variants, behaviors: [], license })`. At least 2 variants. Each variant gives `uses` (it must include every required field), `requires`, optional tighter `caps`, a `describe` of at most 40 words, and a `signature` from the closed lists in `src/manifest/contract.ts`. Variant names are stored in saved sites: never rename one.
   - `component.tsx`: a default-exported function `({ content, variant, ctx }: BlockProps<'<section>'>)`. Import only from `../../kit/index.tsx`.
3. Register it in `src/manifest/index.ts` and `src/components/index.ts`.
4. Run `pnpm test` in this package. The block must render the shared test content for its section type (`@repo/spec/fixtures`) in every variant that the content is eligible for.

## Rules the tests enforce

- A pure function of its content: no hooks, no context, no state, no `window`, `document`, `fetch`, `Math.random` or `Date.now`.
- No `style` prop and no `dangerouslySetInnerHTML`. The only inline style in the library is the focal point in the kit's `Picture`.
- Theme tokens only. Tailwind's default theme is wiped (`src/kit/kit.css`), so classes such as `p-4`, `text-xl`, `bg-red-500` or `md:flex` produce nothing and fail the class check. Use `gap-md`, `py-section`, `bg-accent`, `type-display`, `rounded-card`, and container queries `@md:` and `@lg:`.
- No literal colours, sizes or arbitrary values (`[13px]`), no `dark:`, no `!important`.
- Class names must be literal strings, in `className="…"` or `cx('…', cond && '…')`, so they can be checked.
- Every section type with an image field keeps at least one variant without an image.
- Licence: in-house, or MIT, Apache-2.0, ISC or BSD with the notice kept. Never copy from the sources CLAUDE.md lists.

`src/kit/draft-theme.css` is a placeholder so blocks render in tests. It is not a style proposal.
