import { defineBlock } from '../../manifest/contract.ts'

export default defineBlock({
  type: 'text-media/split',
  version: '1.0.0',
  sectionType: 'text-media',
  variants: {
    'image-start': {
      label: 'Photo, then text',
      describe:
        'One photo before the text, side by side on wide screens. For an introduction or story with one good photo of the place, the work or the people.',
      uses: ['eyebrow', 'headline', 'body', 'primaryCta', 'secondaryCta', 'media'],
      requires: ['media'],
      signature: {
        media: 'image',
        align: 'start',
        density: 'regular',
        emphasis: 'balanced',
        arrangement: 'split',
      },
    },
    'image-end': {
      label: 'Text, then photo',
      describe:
        'Text first and one photo after it, side by side on wide screens. For a story with one good photo, or to alternate with a photo-first section above.',
      uses: ['eyebrow', 'headline', 'body', 'primaryCta', 'secondaryCta', 'media'],
      requires: ['media'],
      signature: {
        media: 'image',
        align: 'start',
        density: 'regular',
        emphasis: 'balanced',
        arrangement: 'split',
      },
    },
    'text-only': {
      label: 'Text in one column',
      describe:
        'A single readable column of text with no image. For a story, policy or explanation that stands on its words, or when no good photo exists yet.',
      uses: ['eyebrow', 'headline', 'body', 'primaryCta', 'secondaryCta'],
      signature: {
        media: 'none',
        align: 'start',
        density: 'regular',
        emphasis: 'type',
        arrangement: 'stack',
      },
    },
  },
  behaviors: [],
  license: { spdx: 'Apache-2.0', source: 'in-house' },
})
