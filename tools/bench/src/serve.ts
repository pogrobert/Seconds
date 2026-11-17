// Serves the bench reports and the blind rating page on http://localhost:8791, and keeps
// Robert's ratings in tools/bench/ratings.json (committed: they are the taste record).
//   pnpm --filter @repo/bench serve

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { dirname, extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const runs = join(root, 'runs')
const ratingsFile = join(root, 'ratings.json')
const port = Number(process.env.PORT ?? 8791)
const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript',
}

type Rating = {
  a: string
  b: string
  brief: string
  site: string
  winner: 'a' | 'b' | 'tie'
  at: string
}
const readRatings = (): Rating[] =>
  existsSync(ratingsFile) ? (JSON.parse(readFileSync(ratingsFile, 'utf8')) as Rating[]) : []

createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${port}`)
  const send = (code: number, body: string | Buffer, type = 'text/plain') => {
    res.writeHead(code, { 'content-type': type, 'cache-control': 'no-store' })
    res.end(body)
  }
  if (url.pathname === '/api/runs') {
    const list = existsSync(runs)
      ? readdirSync(runs)
          .filter((d) => existsSync(join(runs, d, 'summary.json')))
          .sort()
          .reverse()
          .map((d) => {
            const s = JSON.parse(readFileSync(join(runs, d, 'summary.json'), 'utf8'))
            return {
              summary: s.summary,
              records: s.records.map(
                (r: { brief: { id: string }; ok: boolean; sites: unknown[] }) => ({
                  brief: r.brief.id,
                  ok: r.ok,
                  sites: r.sites,
                }),
              ),
            }
          })
      : []
    return send(200, JSON.stringify(list), TYPES['.json'])
  }
  if (url.pathname === '/api/ratings' && req.method === 'POST') {
    let body = ''
    req.on('data', (d) => {
      body += d
    })
    req.on('end', () => {
      const r = JSON.parse(body) as Rating
      const all = readRatings().filter(
        (x) => !(x.a === r.a && x.b === r.b && x.brief === r.brief && x.site === r.site),
      )
      all.push({ ...r, at: new Date().toISOString() })
      writeFileSync(ratingsFile, JSON.stringify(all, null, 1))
      send(200, JSON.stringify({ saved: all.length }), TYPES['.json'])
    })
    return
  }
  if (url.pathname === '/api/ratings')
    return send(200, JSON.stringify(readRatings()), TYPES['.json'])

  // Static files: / → the newest report, /rate.html, /runs/…
  let path = url.pathname
  if (path === '/') {
    const newest = existsSync(runs)
      ? readdirSync(runs)
          .filter((d) => existsSync(join(runs, d, 'report.html')))
          .sort()
          .pop()
      : undefined
    res.writeHead(302, { location: newest ? `/runs/${newest}/report.html` : '/rate.html' })
    return res.end()
  }
  if (path === '/rate.html') path = '/src/rate.html'
  const file = normalize(join(root, decodeURIComponent(path)))
  if (!file.startsWith(root) || !existsSync(file) || !statSync(file).isFile())
    return send(404, 'not found')
  send(200, readFileSync(file), TYPES[extname(file)] ?? 'application/octet-stream')
}).listen(port, '127.0.0.1', () => console.log(`bench: http://localhost:${port}`))
