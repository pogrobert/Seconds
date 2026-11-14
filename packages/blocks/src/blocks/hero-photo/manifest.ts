import { defineBlock } from '../../manifest/contract.ts'

// Round 3 of the Wall (docs/m0/05-wall-round-3.md): four more openings led by photos, after Robert found the three
// photo-led heroes alone gave sites that all looked the same. Candidates until his picks decide.
const USES = ['eyebrow', 'headline', 'subhead', 'primaryCta', 'secondaryCta', 'proof'] as const

export default defineBlock({
  type: 'hero/photo',
  version: '1.0.0',
  sectionType: 'hero',
  variants: {
    half: {
      label: 'Half photo, half colour',
      describe:
        'The page split edge to edge: one photo fills one half, the other half is solid brand colour with the headline and buttons. For a bold, graphic opening that puts the brand colour first.',
      uses: [...USES, 'media'],
      requires: ['media'],
      caps: { headline: 56, subhead: 150 },
      signature: {
        media: 'image',
        align: 'start',
        density: 'regular',
        emphasis: 'balanced',
        arrangement: 'split',
      },
    },
    cover: {
      label: 'Magazine cover',
      describe:
        'One photo across the full width with the business name huge across its top, like a magazine masthead, and the headline and buttons at its foot. For a striking photo and a short name.',
      uses: [...USES, 'media'],
      requires: ['media'],
      caps: { headline: 44, subhead: 110 },
      signature: {
        media: 'image',
        align: 'start',
        density: 'airy',
        emphasis: 'image',
        arrangement: 'overlay',
      },
    },
    portrait: {
      label: 'Tall photo off the edge',
      describe:
        'The words on one side with lots of space, and one tall photo that runs off the top and the side of the page. For a portrait photo of a person or a detail, and a calm, upmarket feel.',
      uses: [...USES, 'media'],
      requires: ['media'],
      caps: { headline: 48, subhead: 150 },
      signature: {
        media: 'image',
        align: 'start',
        density: 'airy',
        emphasis: 'balanced',
        arrangement: 'split',
      },
    },
    triptych: {
      label: 'Three photos side by side',
      describe:
        'The headline and buttons above a row of two or three tall photos, edge to edge. For a business with several good photos that together tell what it does: the place, the work, the result.',
      uses: [...USES, 'gallery'],
      requires: ['gallery'],
      caps: { headline: 48, subhead: 150 },
      signature: {
        media: 'gallery',
        align: 'start',
        density: 'regular',
        emphasis: 'image',
        arrangement: 'grid',
      },
    },
  },
  behaviors: [],
  license: { spdx: 'Apache-2.0', source: 'in-house' },
})
