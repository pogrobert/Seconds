import { defineBlock } from '../../manifest/contract.ts'

export default defineBlock({
  type: 'header/utility',
  version: '1.0.0',
  sectionType: 'header',
  variants: {
    bar: {
      label: 'Contact strip above the menu',
      describe:
        'A thin strip with the phone number, email, address or social links above the logo and menu. For trades, clinics and salons whose visitors want to call or find them straight away.',
      uses: ['nav', 'primaryCta', 'facts'],
      requires: ['facts'],
      signature: {
        media: 'none',
        align: 'start',
        density: 'compact',
        emphasis: 'type',
        arrangement: 'bar',
      },
    },
    minimal: {
      label: 'Logo, button and a menu button',
      describe:
        'Only the logo and one button on every screen, with all menu links behind a Menu button. For one-page sites, portfolios and quiet, image-led sites where the menu should stay out of the way.',
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
