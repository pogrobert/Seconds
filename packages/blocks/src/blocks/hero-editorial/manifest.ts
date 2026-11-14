import { defineBlock } from '../../manifest/contract.ts'

export default defineBlock({
  type: 'hero/editorial',
  version: '1.0.0',
  sectionType: 'hero',
  variants: {
    stacked: {
      label: 'Jumbo headline over a photo band',
      describe:
        'A very large short headline across the page, then one photo across the full width below it. For a confident brand with a punchy three-to-six word promise and one wide photo of the place.',
      uses: ['eyebrow', 'headline', 'subhead', 'primaryCta', 'secondaryCta', 'media', 'proof'],
      requires: ['media'],
      caps: { headline: 36, subhead: 140 },
      signature: {
        media: 'image',
        align: 'start',
        density: 'airy',
        emphasis: 'type',
        arrangement: 'stack',
      },
    },
    framed: {
      label: 'Framed photo with a headline panel',
      describe:
        'A large photo set in from the edge, with the headline on a solid panel that cuts into its lower corner. For a calm, magazine-like opening when the photo and the words matter equally.',
      uses: ['eyebrow', 'headline', 'subhead', 'primaryCta', 'secondaryCta', 'media', 'proof'],
      requires: ['media'],
      caps: { headline: 56, subhead: 150 },
      signature: {
        media: 'image',
        align: 'start',
        density: 'regular',
        emphasis: 'balanced',
        arrangement: 'stack',
      },
    },
    card: {
      label: 'Floating card on a full-bleed photo',
      describe:
        'One photo across the full width with all the words on a solid card at its lower start corner. For a striking photo that should stay untouched by shading, with a clear booking action.',
      uses: ['eyebrow', 'headline', 'subhead', 'primaryCta', 'secondaryCta', 'media', 'proof'],
      requires: ['media'],
      caps: { headline: 44, subhead: 120 },
      signature: {
        media: 'image',
        align: 'start',
        density: 'compact',
        emphasis: 'image',
        arrangement: 'overlay',
      },
    },
  },
  behaviors: [],
  license: { spdx: 'Apache-2.0', source: 'in-house' },
})
