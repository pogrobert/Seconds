import { defineBlock } from '../../manifest/contract.ts'

export default defineBlock({
  type: 'hero/standard',
  version: '1.0.0',
  sectionType: 'hero',
  variants: {
    centered: {
      label: 'Centred type',
      describe:
        'Headline, short supporting line and buttons centred, with no image. For a strong short promise, or when no good photo exists yet.',
      uses: ['eyebrow', 'headline', 'subhead', 'primaryCta', 'secondaryCta', 'proof'],
      signature: {
        media: 'none',
        align: 'center',
        density: 'airy',
        emphasis: 'type',
        arrangement: 'stack',
      },
    },
    split: {
      label: 'Text beside a photo',
      describe:
        'Text on one side and one photo on the other. For businesses with one strong photo of the place, the work or the people.',
      uses: ['eyebrow', 'headline', 'subhead', 'primaryCta', 'secondaryCta', 'media', 'proof'],
      requires: ['media'],
      caps: { headline: 60, subhead: 160 },
      signature: {
        media: 'image',
        align: 'start',
        density: 'regular',
        emphasis: 'balanced',
        arrangement: 'split',
      },
    },
    collage: {
      label: 'Text beside a set of photos',
      describe:
        'Text on one side and two or three photos arranged together on the other. For restaurants, salons and studios with several good photos.',
      uses: ['eyebrow', 'headline', 'subhead', 'primaryCta', 'secondaryCta', 'gallery', 'proof'],
      requires: ['gallery'],
      caps: { headline: 56, subhead: 150 },
      signature: {
        media: 'gallery',
        align: 'start',
        density: 'regular',
        emphasis: 'image',
        arrangement: 'split',
      },
    },
  },
  behaviors: [],
  license: { spdx: 'Apache-2.0', source: 'in-house' },
})
