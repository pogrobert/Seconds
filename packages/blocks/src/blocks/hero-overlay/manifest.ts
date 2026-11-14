import { defineBlock } from '../../manifest/contract.ts'

export default defineBlock({
  type: 'hero/overlay',
  version: '1.0.0',
  sectionType: 'hero',
  variants: {
    bottom: {
      label: 'Text at the foot of a wide photo',
      describe:
        'One large photo across the page with a short headline and buttons at its lower start corner. For a place or scene that sells itself: a dining room, a finished kitchen, a studio.',
      uses: ['eyebrow', 'headline', 'subhead', 'primaryCta', 'secondaryCta', 'media', 'proof'],
      requires: ['media'],
      caps: { headline: 48, subhead: 120 },
      signature: {
        media: 'image',
        align: 'start',
        density: 'regular',
        emphasis: 'image',
        arrangement: 'overlay',
      },
    },
    center: {
      label: 'Text centred on a wide photo',
      describe:
        'One large, evenly shaded photo with a very short headline and buttons in the middle. For a bold opening line over an atmospheric photo whose subject has no single focal point.',
      uses: ['eyebrow', 'headline', 'subhead', 'primaryCta', 'secondaryCta', 'media', 'proof'],
      requires: ['media'],
      caps: { headline: 40, subhead: 100 },
      signature: {
        media: 'image',
        align: 'center',
        density: 'airy',
        emphasis: 'image',
        arrangement: 'overlay',
      },
    },
  },
  behaviors: [],
  license: { spdx: 'Apache-2.0', source: 'in-house' },
})
