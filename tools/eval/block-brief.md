# Brief: write blocks to the contract (M0)

You are writing blocks for a website builder. A block is one ready-made design for one section type, such as a menu bar, a price list or opening hours. The builder never writes component code at request time: it picks blocks and variants and fills their fields. So every block must be correct for any content its section type allows.

M0 measures how long blocks take to write to a strict contract and how often the checks fail. **Your time and failures are data. Record them honestly; do not hide failures.**

## Read first

From the repository root:

1. `packages/blocks/AGENTS.md`: how to add a block, and the rules the tests enforce.
2. `packages/blocks/src/manifest/contract.ts`: the manifest shape, the signature lists and the checks.
3. `packages/blocks/src/kit/`: the only building pieces you may use: `core.ts`, `primitives.tsx`, `facts.tsx`. The token classes are in `kit.css`.
4. `packages/blocks/src/blocks/hero-standard/`: a finished block to copy the pattern from.
5. `packages/spec/src/section-types.ts`: your section type's fields and limits.
6. `packages/spec/src/fixtures/index.ts`: the test content every block of your section type must render (shortest, typical, longest, right-to-left).
7. `docs/decisions/0001-section-types.md`, section "Answers": the design rules that were decided. These include no rotating slides, menus with up to 6 links and one dropdown level opened by click, no third-party embeds, and one business per site.

## Rules

- Create files **only** in your own block folders, `packages/blocks/src/blocks/<section>-<name>/`, and in your log file. Do not edit the kit, the contract, the spec, the tests, the registry files or anyone else's folder. Other agents are working in the same checkout at the same time.
- Do not run `pnpm registry`, `pnpm install`, `git` commands or the full test suite. The coordinator runs those.
- Each block needs at least 2 variants. Variant names are stored in saved sites forever, so choose them carefully: lowercase words such as `split` or `columns`.
- Every field a variant shows needs `data-slot="<field>"` on its outermost element. For example: `data-slot="items"` on the list, `data-slot="facts"` around business facts, `data-slot="source"` around items drawn from a collection, `data-slot="nav"` (the kit's `NavMenu` adds it).
- Keep signatures honest: the decision model chooses by them.
- Set `caps` lower than the section limit when your layout cannot hold the longest allowed text. The browser check fills each variant to its caps and fails if anything overflows at 360 px.
- If the kit or contract lacks something you need, do not work around a rule. Choose the closest design that follows the rules, and write what was missing in your log under `wanted`.
- Design: the look comes from themes, so build a clear, restrained layout from tokens only. Use generous spacing, a strong hierarchy and one primary action, with nothing decorative for its own sake. The research found that well-designed small-business sites keep sections quiet and single-purpose.
- Accessibility: real headings in order (the kit's `Heading` sets the level), lists as lists, tables for tabular facts, links with text, and tap targets of at least `min-h-tap`.

## Checks

Run from `packages/blocks`, for each of your blocks:

```bash
BLOCK=<folder> pnpm exec vitest run
```

```bash
BLOCK=<folder> pnpm test:browser
```

```bash
pnpm exec tsc --noEmit
```

Ignore type errors in other agents' folders. A block is done when both test commands pass with zero failures and `tsc` shows no errors in your files.

## Log (required)

1. Before reading anything, run `date -u +%Y-%m-%dT%H:%M:%SZ` and keep the time.
2. Count every run of the two test commands, and note the main reason for each failing run.
3. When a block is done, run `date -u +%Y-%m-%dT%H:%M:%SZ` again.
4. Write one file per block, `tools/eval/block-log/<folder>.json`:

```json
{
  "block": "<section>/<name>",
  "started": "<UTC time you started work on this block>",
  "finished": "<UTC time it passed>",
  "testRuns": 0,
  "failedRuns": 0,
  "failures": [
    {
      "check": "contract | purity | classes | render | browser-overflow | browser-axe | types",
      "what": "one line"
    }
  ],
  "wanted": ["anything the kit or contract lacked, or empty"],
  "notes": "one or two sentences"
}
```

For your first block, `started` is the time from step 1. For each block after that, it is the time the previous block passed.

## Report back

Reply with:

- each block's type, its variants and one line on each
- the pass status of both checks
- your `wanted` list

Keep it under 200 words.
