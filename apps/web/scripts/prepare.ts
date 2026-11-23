// Prepares what the build page needs and a Worker cannot make itself (it reads no files):
// public/photos/, the sample businesses' stock photos (licensed, kept out of git), shown only
// when the words for a site could not be written (server/make-site.ts, sampleContent).
// Runs before `pnpm dev`. Run by hand: node scripts/prepare.ts
import { cpSync, existsSync } from 'node:fs'

const here = (p: string) => new URL(p, import.meta.url)
const photos = here('../../../tools/eval/photos/')
if (existsSync(photos)) cpSync(photos, here('../public/photos/'), { recursive: true })
console.log(existsSync(photos) ? 'photos copied' : 'no sample photos (tools/eval/photos)')
