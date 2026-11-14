import { defineBlock } from '../../manifest/contract.ts'

// Full-screen openings for the direction families (docs/m0/09-directions.md). Each variant belongs
// to one direction; the pipeline's DIRECTIONS pairs them with their family and menu bar.
export default defineBlock({
  type: 'hero/stage',
  version: '1.0.0',
  sectionType: 'hero',
  variants: {
    sky: {
      label: 'The name in the sky of a full-screen photo',
      describe:
        'A sunlit photo of the place fills the screen, with the business name large and thin in its sky and the promise small along the foot. For beautiful places and work.',
      uses: ['eyebrow', 'headline', 'media', 'proof'],
      requires: ['media'],
      caps: { headline: 70 },
      signature: {
        media: 'image',
        align: 'center',
        density: 'airy',
        emphasis: 'image',
        arrangement: 'overlay',
      },
    },
    pair: {
      label: 'The name across two photos',
      describe:
        'Two close-up photos side by side fill the screen, with the business name running across both, large and thin. For food, plates, hair or materials.',
      uses: ['headline', 'gallery', 'proof'],
      requires: ['gallery'],
      caps: { headline: 70 },
      signature: {
        media: 'gallery',
        align: 'center',
        density: 'airy',
        emphasis: 'image',
        arrangement: 'overlay',
      },
    },
    lettered: {
      label: 'The name lettered with drawings',
      describe:
        'No photo: the name in heavy condensed capitals, one word to a line, with the first O and A drawn as pictures from the trade. For businesses with character and no good photos.',
      uses: ['headline', 'primaryCta', 'secondaryCta'],
      caps: { headline: 70 },
      signature: {
        media: 'none',
        align: 'center',
        density: 'airy',
        emphasis: 'type',
        arrangement: 'stack',
      },
    },
    feature: {
      label: 'A large light headline low on a bright photo',
      describe:
        'A bright, airy photo fills the screen, with a large light serif headline, a short line and one button low at the start, on a wash of the page colour. For daylit studios.',
      uses: ['headline', 'subhead', 'primaryCta', 'secondaryCta', 'media'],
      requires: ['media'],
      caps: { headline: 48, subhead: 130 },
      signature: {
        media: 'image',
        align: 'start',
        density: 'airy',
        emphasis: 'balanced',
        arrangement: 'overlay',
      },
    },
  },
  behaviors: [],
  license: { spdx: 'Apache-2.0', source: 'in-house' },
})
