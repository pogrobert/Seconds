import { describe, expect, it } from 'vitest'
import { business, fixtures, id } from '../src/fixtures/index.ts'
import { type SiteSpec, validateSite } from '../src/site.ts'

const home = id('p', 1)
const prices = id('p', 2)
const shell = 'sh_0000000001' as const
const hdr = id('b', 1)
const hero = id('b', 2)
const list = id('b', 3)
const ftr = id('b', 4)

const site = (): SiteSpec => ({
  specVersion: 1,
  release: '2026.11.14',
  structure: {
    pages: {
      [home]: { id: home, kind: 'home', path: '/', shell, body: [hero] },
      [prices]: { id: prices, kind: 'services', path: '/prices', shell, body: [list] },
    },
    shells: { [shell]: { id: shell, before: [hdr], after: [ftr] } },
    blocks: {
      [hdr]: {
        id: hdr,
        sectionType: 'header',
        type: 'header/classic',
        v: 1,
        variant: 'inline',
        props: {},
      },
      [hero]: {
        id: hero,
        sectionType: 'hero',
        type: 'hero/standard',
        v: 1,
        variant: 'split',
        props: { surface: 'base' },
      },
      [list]: {
        id: list,
        sectionType: 'price-list',
        type: 'price-list/menu',
        v: 1,
        variant: 'list',
        props: {},
      },
      [ftr]: {
        id: ftr,
        sectionType: 'footer',
        type: 'footer/simple',
        v: 1,
        variant: 'centered',
        props: { surface: 'muted' },
      },
    },
  },
  style: { family: 'draft@1', axes: { density: 'regular' }, color: '#4a6b5d', mode: 'light' },
  content: {
    business,
    pages: { [home]: { navLabel: 'Home' }, [prices]: { navLabel: 'Prices' } },
    blocks: {
      [hdr]: {
        nav: [
          { id: id('i', 1), label: 'Home', to: { type: 'page', page: home } },
          { id: id('i', 2), label: 'Prices', to: { type: 'page', page: prices } },
        ],
      },
      [hero]: {
        ...fixtures.hero.typical.content,
        secondaryCta: { label: 'See prices', to: { type: 'page', page: prices } },
      },
      [list]: fixtures['price-list'].typical.content,
      [ftr]: { facts: ['address', 'hours'] },
    },
    collections: fixtures['price-list'].typical.context.collections,
    assets: {
      ...Object.fromEntries(
        [20, 21].map((n) => [
          id('a', n),
          {
            id: id('a', n),
            type: 'image' as const,
            source: {
              type: 'generated' as const,
              generator: 'surfaces' as const,
              style: 'riso',
              seed: `menu-${n}`,
            },
            alt: 'Menu photo',
          },
        ]),
      ),
      [id('a', 1)]: {
        id: id('a', 1),
        type: 'image',
        source: { type: 'generated', generator: 'surfaces', style: 'riso', seed: 'northside-hero' },
        alt: 'A stylist finishing a soft copper balayage',
      },
    },
  },
  settings: { locale: 'en-GB', dir: 'ltr', mobileActions: ['call', 'book'] },
})

describe('validateSite', () => {
  it('accepts a valid two-page site', () => {
    const r = validateSite(site())
    expect(r.ok ? [] : r.problems).toEqual([])
  })
  const broken: [string, (s: SiteSpec) => void, RegExp][] = [
    ['a block placed twice', (s) => s.structure.pages[home]?.body.push(list), /placed 2 times/],
    ['a block with no content', (s) => delete s.content.blocks[hero], /no content/],
    [
      'content that breaks its section type',
      (s) => ((s.content.blocks[hero] as { headline: string }).headline = 'x'.repeat(71)),
      /headline/,
    ],
    [
      'a link to a missing page',
      (s) =>
        ((s.content.blocks[hero] as { secondaryCta: { to: unknown } }).secondaryCta.to = {
          type: 'page',
          page: id('p', 9),
        }),
      /page p_0000000009 does not exist/,
    ],
    [
      'a missing image',
      (s) => delete s.content.assets[id('a', 1)],
      /images: a_0000000001 does not exist/,
    ],
    [
      'an unknown collection',
      (s) =>
        ((s.content.blocks[list] as { source: { collection: string } }).source.collection = id(
          'c',
          9,
        )),
      /collection c_0000000009 does not exist/,
    ],
    [
      'two home pages',
      (s) => {
        const p = s.structure.pages[prices]
        if (p) p.kind = 'home'
      },
      /exactly one home page/,
    ],
    ['a reserved key in use', (s) => Object.assign(s, { capabilities: {} }), /capabilities/],
    [
      'a block of the wrong type',
      (s) => {
        const b = s.structure.blocks[hero]
        if (b) b.type = 'cards/grid'
      },
      /not a hero block/,
    ],
  ]
  for (const [name, breakIt, expected] of broken) {
    it(`rejects ${name}`, () => {
      const s = structuredClone(site())
      breakIt(s)
      const r = validateSite(s)
      expect(r.ok).toBe(false)
      if (!r.ok) expect(r.problems.join('\n')).toMatch(expected)
    })
  }
})
