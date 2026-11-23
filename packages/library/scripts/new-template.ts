// Starts a new template: `pnpm --filter @repo/library new-template <id> [Label]`.
// Writes src/templates/<id>.tsx from a plain, working starter that follows the contract in
// src/templates/README.md and uses the shared pieces, and registers it as a draft (drafts are
// drawn by the gate and the review wall, never offered to an owner). Then design it, run the
// gate (tools/bench/src/template-gate.ts), have it reviewed, and drop `draft` when it is kept.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

const [id, label = id && id[0]?.toUpperCase() + id.slice(1)] = process.argv.slice(2)
if (!id || !/^[a-z][a-z0-9]*$/.test(id)) {
  console.error(
    'Usage: pnpm --filter @repo/library new-template <id> [Label]   (id: lower case a-z, 0-9)',
  )
  process.exit(1)
}
const dir = new URL('../src/templates/', import.meta.url)
const file = new URL(`${id}.tsx`, dir)
if (existsSync(file)) {
  console.error(`src/templates/${id}.tsx already exists`)
  process.exit(1)
}

writeFileSync(
  file,
  `// ${label}: a new template. Say in a few lines what it looks like and what it is for, as the
// other templates do. Contract: src/templates/README.md.

import { Fragment } from 'react'
import {
  type Extra,
  FactRows,
  FaqList,
  facts,
  hasVisit,
  ListItems,
  links,
  listOf,
  NavLinks,
  offerItems,
  Pic,
  present,
  RESET,
  reachOf,
  type Template,
  type TemplateProps,
} from './shared.tsx'

const CSS = \`\${RESET}
:root{--ink:color-mix(in oklab,var(--band) 20%,#191919);--paper:#fff;--quiet:color-mix(in oklab,var(--ink) 62%,var(--paper));--line:color-mix(in oklab,var(--band) 14%,#e9e7e2);--w:68rem;--gut:clamp(1.25rem,4vw,3rem);--sec:clamp(4rem,8vw,7rem)}
body{background:var(--paper);color:var(--ink);font-size:1.0625rem;line-height:1.6}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.sec{padding-block:var(--sec)}
.top{display:flex;justify-content:space-between;align-items:center;gap:1rem;padding-block:1.25rem}
.top nav{display:flex;gap:1.5rem}.top nav a{text-decoration:none}
h1{font-size:clamp(2.4rem,6vw,4.5rem);line-height:1.05;margin-block:.75rem 1rem}
h2{font-size:clamp(1.6rem,3.5vw,2.4rem);line-height:1.15;margin-bottom:1.5rem}
.sub{color:var(--quiet);max-width:40rem}
.btn{display:inline-block;margin-top:1.75rem;padding:.9rem 1.6rem;border-radius:var(--button-radius);background:var(--band);color:var(--band-foreground);text-decoration:none;font-weight:600}
.hero img{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:var(--radius);margin-top:3rem}
.items li,.list li,.faq>div{border-top:1px solid var(--line);padding-block:1.25rem}
.items h3{display:flex;justify-content:space-between;gap:1rem}
.items p,.list p,.faq p{color:var(--quiet)}
.list .n{color:var(--band);font-weight:600}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:1rem}.pair img{aspect-ratio:4/3;object-fit:cover;border-radius:var(--radius)}
footer dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(11rem,1fr));gap:1.5rem;margin-top:2.5rem}
footer dt{color:var(--quiet);font-size:.9rem}footer dd a{text-decoration:none}
.foot{padding-block:2rem;color:var(--quiet);font-size:.9rem;border-top:1px solid var(--line)}
@media (max-width:760px){.top nav{display:none}.pair{grid-template-columns:1fr}}\`

function Extras({ c, x }: { c: TemplateProps['c']; x: Extra }) {
  if (x === 'statement')
    return (
      <section className="sec">
        <div className="w">
          <p className="say">{c.statement}</p>
        </div>
      </section>
    )
  if (x === 'faq')
    return (
      <section className="sec" id="questions">
        <div className="w faq">
          <h2>Questions</h2>
          <FaqList faq={c.faq} />
        </div>
      </section>
    )
  if (x === 'gallery')
    return (
      <section className="sec">
        <div className="w pair">
          <figure>
            <Pic photo={c.photos.d2} />
          </figure>
          <figure>
            <Pic photo={c.photos.cta} />
          </figure>
        </div>
      </section>
    )
  const l = listOf(c, x)
  if (!l) return null
  return (
    <section className="sec">
      <div className="w">
        <h2>{l.title}</h2>
        <ol className="list">
          <ListItems items={l.items} numbered={x === 'steps'} />
        </ol>
      </div>
    </section>
  )
}

function Page({ c, extras }: TemplateProps) {
  const xs = present(c, extras)
  const f = facts(c)
  const reach = reachOf(f)
  return (
    <>
      <div className="w top">
        <b>{c.name}</b>
        <nav>
          <NavLinks links={links(c, extras)} />
        </nav>
      </div>
      <header className="w hero">
        <p className="sub">{c.tagline}</p>
        <h1>{c.headline}</h1>
        <p className="sub">{c.subhead}</p>
        {reach && (
          <a className="btn" href={reach.href}>
            {c.cta.label}
          </a>
        )}
        <Pic photo={c.photos.hero} eager />
      </header>
      <main>
        <section className="sec">
          <div className="w">
            <p>{c.about}</p>
          </div>
        </section>
        <section className="sec" id="offer">
          <div className="w">
            <h2>{c.offerTitle}</h2>
            <ul className="items">
              {offerItems(c).map((it) => (
                <li key={it.name}>
                  <h3>
                    <span>{it.name}</span>
                    {it.price && <span>{it.price}</span>}
                  </h3>
                  {it.detail && <p>{it.detail}</p>}
                </li>
              ))}
            </ul>
          </div>
        </section>
        {xs.map((x) => (
          <Fragment key={x}>
            <Extras c={c} x={x} />
          </Fragment>
        ))}
      </main>
      <footer id="visit" className="w sec">
        <h2>{c.cta.headline}</h2>
        <p className="sub">{c.cta.subhead}</p>
        {hasVisit(c) && (
          <dl>
            <FactRows facts={f} />
          </dl>
        )}
        <div className="foot">
          {c.name} · {c.tagline}
        </div>
      </footer>
    </>
  )
}

export const ${id}: Template = {
  id: '${id}',
  label: '${label}',
  // What the decision model reads: one sentence on the look and feel, ending with the kinds of
  // business it suits ("..., for cafés, bakeries and delis.").
  text: 'Describe the look and feel here, for the kinds of business it suits.',
  dark: false,
  draft: true,
  css: CSS,
  Page,
}
`,
)

// Register it: an import beside the others and an entry at the end of TEMPLATES.
const index = new URL('index.tsx', dir)
let src = readFileSync(index, 'utf8')
const lastImport = [...src.matchAll(/^import \{ \w+ \} from '\.\/\w+\.tsx'\n/gm)].at(-1)
if (!lastImport || lastImport.index === undefined)
  throw new Error('index.tsx: no template imports found')
const at = lastImport.index + lastImport[0].length
src = `${src.slice(0, at)}import { ${id} } from './${id}.tsx'\n${src.slice(at)}`
src = src.replace(/(export const TEMPLATES: Template\[\] = \[[\s\S]*?)(\n\])/, `$1\n  ${id},$2`)
writeFileSync(index, src)
console.log(`Made src/templates/${id}.tsx (a draft) and registered it in index.tsx.
Next: design it, then
  pnpm --filter @repo/library test   (add its fingerprints: UPDATE_HASHES=1)
  the gate: tools/bench/src/template-gate.ts`)
