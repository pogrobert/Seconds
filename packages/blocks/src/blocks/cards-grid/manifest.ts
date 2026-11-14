import { defineBlock } from '../../manifest/contract.ts'

export default defineBlock({
  type: 'cards/grid',
  version: '1.0.0',
  sectionType: 'cards',
  variants: {
    plain: {
      label: 'Grid of short texts',
      describe:
        'Titles with a few lines of text in two to four columns, no boxes and no images. For three to nine services, reasons to choose the business or values.',
      uses: ['eyebrow', 'headline', 'subhead', 'items', 'primaryCta', 'note'],
      caps: { items: { max: 12, parts: { body: 240 } } },
      signature: {
        media: 'none',
        align: 'start',
        density: 'airy',
        emphasis: 'type',
        arrangement: 'grid',
      },
    },
    images: {
      label: 'Grid of cards with photos',
      describe:
        'Each card shows its own photo above the title and a short text. For services or rooms where every item has a good picture.',
      uses: ['eyebrow', 'headline', 'subhead', 'items', 'primaryCta', 'note'],
      caps: { items: { max: 12, parts: { body: 160 } } },
      // The images are a part of each item; the contract counts item images as images.
      signature: {
        media: 'image',
        align: 'start',
        density: 'regular',
        emphasis: 'image',
        arrangement: 'grid',
      },
    },
    bordered: {
      label: 'Grid of boxed cards',
      describe:
        'Each item in its own outlined box, with an optional link at the bottom. For services or offers that each lead to their own page.',
      uses: ['eyebrow', 'headline', 'subhead', 'items', 'primaryCta', 'note'],
      caps: { items: { max: 12, parts: { body: 240 } } },
      signature: {
        media: 'none',
        align: 'start',
        density: 'regular',
        emphasis: 'balanced',
        arrangement: 'grid',
      },
    },
  },
  behaviors: [],
  license: { spdx: 'Apache-2.0', source: 'in-house' },
})
