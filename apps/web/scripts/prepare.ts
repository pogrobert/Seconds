// Prepares what the build page needs and a Worker cannot make itself (it reads no files):
// - src/generated/blocks.css: the kit and every block's classes, compiled once. Each site adds
//   its theme's variables on top.
// - public/photos/: the sample businesses' stock photos (licensed, kept out of git).
// Runs before `pnpm dev`. Run by hand: node scripts/prepare.ts
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { siteCss } from '@repo/blocks/build'
import { manifests } from '@repo/blocks/manifest'

const here = (p: string) => new URL(p, import.meta.url)
mkdirSync(here('../src/generated/'), { recursive: true })
const css = await siteCss(
  manifests.map((m) => m.type),
  '',
)
writeFileSync(here('../src/generated/blocks.css'), css)
const photos = here('../../../tools/eval/photos/')
if (existsSync(photos)) cpSync(photos, here('../public/photos/'), { recursive: true })
console.log(`blocks.css ${Math.round(css.length / 1024)} KB, photos copied`)
