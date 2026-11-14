import { defineBlock } from '../../manifest/contract.ts'

// A menu bar laid over the top of the opening photo, for the direction families (docs/m0/09).
// It has no ground of its own, so it is only planned above a hero that fills the screen from the
// top: a photo with a shaded top edge (on-dark) or a light photo with a light top (on-light).
export default defineBlock({
  type: 'header/over',
  version: '1.0.0',
  sectionType: 'header',
  variants: {
    'on-dark': {
      label: 'Light menu over a dark photo',
      describe:
        'The name at the start and a few quiet links at the end, in light type over the top of a full-screen photo or a black opening. For pages where the photo is the first thing seen.',
      uses: ['nav', 'primaryCta'],
      signature: {
        media: 'none',
        align: 'start',
        density: 'airy',
        emphasis: 'type',
        arrangement: 'bar',
      },
    },
    'on-light': {
      label: 'Dark menu over a light photo',
      describe:
        'The name, the menu and one rounded button in dark type over the top of a bright, airy photo. For studios and calm interiors photographed in daylight.',
      uses: ['nav', 'primaryCta'],
      signature: {
        media: 'none',
        align: 'start',
        density: 'airy',
        emphasis: 'type',
        arrangement: 'bar',
      },
    },
  },
  behaviors: [],
  license: { spdx: 'Apache-2.0', source: 'in-house' },
})
