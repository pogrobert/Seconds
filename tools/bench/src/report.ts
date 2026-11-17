// One run's report page: the numbers first, then every brief with its three versions.
import type { BriefRecord } from './run.ts'

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c)

export function reportHtml(
  summary: Record<string, unknown>,
  records: BriefRecord[],
  shared: { photo: string; briefs: string[] }[],
): string {
  const s = summary as {
    runId: string
    commit: string
    uncommitted: number
    built: number
    failed: number
    msMedian: number
    msP90: number
    photosMsMedian: number
    costUsdPerSite: number
    costUsdTotal: number
    pageProblems: number
    factFlags: number
    noPhotoSites: number
    sharedPhotos: number
  }
  const stat = (label: string, v: string, bad = false) =>
    `<div class="stat${bad ? ' bad' : ''}"><b>${v}</b><span>${label}</span></div>`
  const rows = records
    .map((r) => {
      const head = `<h2 id="${r.brief.id}">${esc(r.brief.id)} <small>${r.brief.tags.join(' · ')}</small></h2><p class="words">“${esc(r.brief.words)}”</p>`
      if (!r.ok) return `<section>${head}<p class="bad">Failed: ${esc(r.error ?? '')}</p></section>`
      const ms = r.ms
      const info = [
        `${esc(r.name ?? '')}, ${esc(r.kind ?? '')}`,
        `${ms?.total} ms (words ${ms?.text}, photos ${ms?.photos})`,
        `${(r.costUsd ?? 0).toFixed(4)} USD`,
        `searches: ${esc((r.photoSearches ?? []).join(' / '))}`,
      ].join(' · ')
      const flags = [
        ...(r.notes ?? []).map((n) => `note: ${n}`),
        ...r.facts.map((f) => `fact: ${f}`),
        ...r.sites.flatMap((x) => [
          ...x.problems.desktop.map((p) => `${x.id} desktop: ${p}`),
          ...x.problems.phone.map((p) => `${x.id} phone: ${p}`),
        ]),
      ]
      const sites = r.sites
        .map(
          (x) => `<figure>
  <a href="${r.brief.id}/${x.id}.html" target="_blank"><img loading="lazy" src="${r.brief.id}/${x.id}-desktop.jpg"></a>
  <a href="${r.brief.id}/${x.id}-full.jpg" target="_blank" class="phone"><img loading="lazy" src="${r.brief.id}/${x.id}-phone.jpg"></a>
  <figcaption>${x.id} · ${x.photos.length} photos<br>${esc(x.blocks.join(' · '))}</figcaption>
</figure>`,
        )
        .join('')
      return `<section>${head}<p class="info">${info}</p>${flags.length ? `<ul class="flags">${flags.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}<div class="sites">${sites}</div></section>`
    })
    .join('')
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bench ${esc(s.runId)}</title>
<style>
:root{--bg:#fafafa;--fg:#111;--muted:#666;--line:#e5e5e5;--bad:#b42318}
body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.45 system-ui,sans-serif;padding:24px max(16px,4vw)}
h1{margin:0 0 4px;font-size:22px}h2{margin:0;font-size:16px}h2 small{color:var(--muted);font-weight:400}
.meta{color:var(--muted);margin:0 0 16px}
.stats{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin-bottom:28px}
.stat{background:#fff;border:1px solid var(--line);border-radius:8px;padding:10px 12px}.stat b{display:block;font-size:20px}.stat span{color:var(--muted);font-size:12px}
.stat.bad b,.bad{color:var(--bad)}
section{border-top:1px solid var(--line);padding:18px 0}
.words{margin:4px 0;font-style:italic}.info{color:var(--muted);margin:4px 0;font-size:12px}
.flags{margin:6px 0;padding-left:18px;color:var(--bad);font-size:12px;columns:2}
.sites{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:10px}
figure{margin:0;position:relative}figure img{width:100%;border:1px solid var(--line);border-radius:6px;display:block}
.phone{position:absolute;right:6px;top:6px;width:22%}.phone img{border-radius:4px;box-shadow:0 2px 8px #0003}
figcaption{font-size:11px;color:var(--muted);margin-top:4px;overflow-wrap:anywhere}
@media (max-width:800px){.sites{grid-template-columns:1fr}.flags{columns:1}}
</style>
<h1>Bench run ${esc(s.runId)}</h1>
<p class="meta">commit ${esc(s.commit)}${s.uncommitted ? ` + ${s.uncommitted} uncommitted files` : ''} · all figures measured on this computer · <a href="/rate.html">rate runs blind</a></p>
<div class="stats">
${stat('sites built', `${s.built}`)}${stat('failed', `${s.failed}`, s.failed > 0)}
${stat('median time', `${(s.msMedian / 1000).toFixed(1)} s`)}${stat('slowest 10%', `${(s.msP90 / 1000).toFixed(1)} s`)}
${stat('median photo time', `${(s.photosMsMedian / 1000).toFixed(1)} s`)}${stat('cost per site', `$${s.costUsdPerSite.toFixed(4)}`)}
${stat('page problems', `${s.pageProblems}`, s.pageProblems > 0)}${stat('fact flags', `${s.factFlags}`, s.factFlags > 0)}
${stat('sites with no photo', `${s.noPhotoSites}`)}${stat('photos shared across briefs', `${s.sharedPhotos}`, s.sharedPhotos > 0)}
</div>
${shared.length ? `<p class="bad">Same photo for different briefs: ${shared.map((x) => `${esc(x.photo)} (${x.briefs.join(', ')})`).join('; ')}</p>` : ''}
${rows}
</html>`
}
