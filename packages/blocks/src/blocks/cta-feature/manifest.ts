import { defineBlock } from '../../manifest/contract.ts'

export default defineBlock({
  type: 'cta/feature',
  version: '1.0.0',
  sectionType: 'cta',
  variants: {
    'photo-banner': {
      label: 'Ask across a full photo',
      describe:
        'One wide photo with the headline at its foot and a single strong button at the far side. For a closing ask that a striking photo of the place, the work or the result carries.',
      uses: ['headline', 'primaryCta', 'media'],
      requires: ['media'],
      signature: {
        media: 'image',
        align: 'start',
        density: 'regular',
        emphasis: 'image',
        arrangement: 'overlay',
      },
    },
    jumbo: {
      label: 'One huge line',
      describe:
        'A very short ask set in huge type across the page, with a ruled line, a quiet supporting sentence and the buttons beneath. For a bold, confident brand with a three-to-five-word ask.',
      uses: ['headline', 'subhead', 'primaryCta', 'secondaryCta'],
      caps: { headline: 28, subhead: 140 },
      signature: {
        media: 'none',
        align: 'start',
        density: 'airy',
        emphasis: 'type',
        arrangement: 'stack',
      },
    },
    'split-panel': {
      label: 'Two-tone colour panels',
      describe:
        'Two colour blocks side by side: the headline large on a brand-coloured panel, the supporting line and buttons on a lighter one. For a strong colour moment between quieter sections, with no photo.',
      uses: ['headline', 'subhead', 'primaryCta', 'secondaryCta'],
      caps: { headline: 48, subhead: 160 },
      signature: {
        media: 'none',
        align: 'start',
        density: 'regular',
        emphasis: 'balanced',
        arrangement: 'split',
      },
    },
  },
  behaviors: [],
  license: { spdx: 'Apache-2.0', source: 'in-house' },
})
