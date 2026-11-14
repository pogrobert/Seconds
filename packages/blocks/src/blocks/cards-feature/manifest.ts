import { defineBlock } from '../../manifest/contract.ts'

export default defineBlock({
  type: 'cards/feature',
  version: '1.0.0',
  sectionType: 'cards',
  variants: {
    bento: {
      label: 'Bento: one large lead tile',
      describe:
        'An uneven grid: the first item is a large tile, filled by its photo when it has one, beside smaller coloured tiles. For two to six services where one leads.',
      uses: ['eyebrow', 'headline', 'subhead', 'items', 'primaryCta', 'note'],
      caps: { items: { max: 6, parts: { title: 48, body: 180 } } },
      // The lead photo is a part of the first item; the contract counts item images as images.
      signature: {
        media: 'image',
        align: 'start',
        density: 'regular',
        emphasis: 'balanced',
        arrangement: 'grid',
      },
    },
    numbers: {
      label: 'Large editorial numbers',
      describe:
        'Each item under a heavy rule with a very large number, 01, 02, 03, above its title. For two to nine steps, reasons or promises that read in order.',
      uses: ['eyebrow', 'headline', 'subhead', 'items', 'primaryCta', 'note'],
      caps: { items: { max: 9, parts: { body: 240 } } },
      signature: {
        media: 'none',
        align: 'start',
        density: 'airy',
        emphasis: 'type',
        arrangement: 'grid',
      },
    },
    tiles: {
      label: 'Solid colour tiles',
      describe:
        'Each item on its own solid colour tile, the colours taking turns, title set large at the foot. For two to nine bold, short services or values on a confident site.',
      uses: ['eyebrow', 'headline', 'subhead', 'items', 'primaryCta', 'note'],
      caps: { items: { max: 9, parts: { title: 48, body: 160 } } },
      signature: {
        media: 'none',
        align: 'start',
        density: 'regular',
        emphasis: 'type',
        arrangement: 'grid',
      },
    },
    accordion: {
      label: 'Open-and-close rows',
      describe:
        'Large ruled rows that open to show their text, the first one open, under group headings when items have groups. For policies, questions or long lists of up to 30 items.',
      uses: ['eyebrow', 'headline', 'subhead', 'items', 'primaryCta', 'note'],
      signature: {
        media: 'none',
        align: 'start',
        density: 'compact',
        emphasis: 'type',
        arrangement: 'list',
      },
    },
  },
  behaviors: [],
  license: { spdx: 'Apache-2.0', source: 'in-house' },
})
