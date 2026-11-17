// Blocks adapted from Tailark (tailark/blocks, commit 8139698, MIT; see ../../../NOTICE.md).
// Each entry names the Tailark file it came from, under registry/bases/radix/.
import type { ComponentType } from 'react'
import type { Entry, Kind } from '../../registry.ts'
import type { BlockProps } from '../../ui.tsx'
import * as about from './about.tsx'
import * as contact from './contact.tsx'
import * as cta from './cta.tsx'
import * as faq from './faq.tsx'
import * as features from './features.tsx'
import * as footer from './footer.tsx'
import * as header from './header.tsx'
import * as hero from './hero.tsx'
import * as stats from './stats.tsx'
import * as team from './team.tsx'
import * as testimonials from './testimonials.tsx'

type Style = 'mist' | 'veil' | 'dusk'

/**
 * One entry. `name` is the Tailark block name; `dir` is its folder under blocks/ when it differs
 * from the kind; `file` overrides the path when the block is a folder (such as hero-section/one).
 */
const e = (
  kind: Kind,
  style: Style,
  name: string,
  component: ComponentType<BlockProps>,
  more: Partial<Entry> & { dir?: string; folder?: boolean; id?: string } = {},
): Entry => {
  const { dir, folder, id, ...rest } = more
  const path = `${style}/blocks/${dir ?? kind}/${name}${folder ? '' : '.tsx'}`
  return {
    id: `tailark/${kind}-${style}-${id ?? name}`,
    kind,
    source: { lib: 'tailark', file: path },
    component,
    ...rest,
  }
}

const H = { dir: 'hero-section', includesHeader: true } as const
const HF = { ...H, folder: true } as const

export const tailark: Entry[] = [
  // header
  e('header', 'mist', 'one', header.HeaderMistOne, { dir: 'hero-section', folder: true }),
  e('header', 'dusk', 'one', header.HeaderDuskOne, { dir: 'hero-section', folder: true }),
  e('header', 'veil', 'five', header.HeaderVeilFive, { dir: 'hero-section' }),

  // hero
  e('hero', 'mist', 'one', hero.HeroMistOne, HF),
  e('hero', 'mist', 'three', hero.HeroMistThree, HF),
  e('hero', 'mist', 'four', hero.HeroMistFour, HF),
  e('hero', 'mist', 'five', hero.HeroMistFive, H),
  e('hero', 'veil', 'one', hero.HeroVeilOne, HF),
  e('hero', 'veil', 'three', hero.HeroVeilThree, HF),
  e('hero', 'veil', 'four', hero.HeroVeilFour, HF),
  e('hero', 'veil', 'five', hero.HeroVeilFive, H),
  e('hero', 'dusk', 'one', hero.HeroDuskOne, HF),
  e('hero', 'dusk', 'two', hero.HeroDuskTwo, HF),
  e('hero', 'dusk', 'three', hero.HeroDuskThree, HF),
  e('hero', 'dusk', 'four', hero.HeroDuskFour, HF),
  e('hero', 'dusk', 'five', hero.HeroDuskFive, HF),
  e('hero', 'dusk', 'six', hero.HeroDuskSix, HF),
  e('hero', 'dusk', 'seven', hero.HeroDuskSeven, HF),
  e('hero', 'dusk', 'eight', hero.HeroDuskEight, H),
  e('hero', 'dusk', 'nine', hero.HeroDuskNine, HF),
  e('hero', 'dusk', 'ten', hero.HeroDuskTen, HF),

  // about
  e('about', 'mist', 'one', about.AboutMistOne, { dir: 'content' }),
  e('about', 'mist', 'three', about.AboutMistThree, { dir: 'content' }),
  e('about', 'mist', 'eight', about.AboutMistEight, { dir: 'features', id: 'features-eight' }),
  e('about', 'veil', 'three', about.AboutVeilThree, { dir: 'content' }),
  e('about', 'dusk', 'one', about.AboutDuskOne, { dir: 'content' }),
  e('about', 'dusk', 'two', about.AboutDuskTwo, { dir: 'content' }),
  e('about', 'dusk', 'three', about.AboutDuskThree, { dir: 'content' }),
  e('about', 'dusk', 'four', about.AboutDuskFour, { dir: 'content' }),

  // offer
  e('offer', 'mist', 'one', features.OfferMistOne, {
    dir: 'features',
    folder: true,
    source: { lib: 'tailark', file: 'mist/blocks/features/one/features.tsx' },
  }),
  e('offer', 'veil', 'two', features.OfferVeilTwo, { dir: 'features' }),
  e('offer', 'veil', 'three', features.OfferVeilThree, { dir: 'features' }),
  e('offer', 'dusk', 'one', features.OfferDuskOne, { dir: 'features' }),
  e('offer', 'dusk', 'six', features.OfferDuskSix, { dir: 'features' }),

  // reasons
  e('reasons', 'mist', 'two', features.ReasonsMistTwo, { dir: 'features' }),
  e('reasons', 'mist', 'three', features.ReasonsMistThree, { dir: 'features' }),
  e('reasons', 'mist', 'five', features.ReasonsMistFive, { dir: 'features' }),
  e('reasons', 'mist', 'six', features.ReasonsMistSix, { dir: 'features' }),
  e('reasons', 'mist', 'nine', features.ReasonsMistNine, { dir: 'features' }),
  e('reasons', 'mist', 'ten', features.ReasonsMistTen, { dir: 'features' }),
  e('reasons', 'mist', 'eleven', features.ReasonsMistEleven, { dir: 'features' }),
  e('reasons', 'veil', 'one', features.ReasonsVeilFeaturesOne, { dir: 'features' }),
  e('reasons', 'veil', 'content-one', about.ReasonsVeilOne, {
    source: { lib: 'tailark', file: 'veil/blocks/content/one.tsx' },
  }),
  e('reasons', 'veil', 'content-two', about.ReasonsVeilTwo, {
    source: { lib: 'tailark', file: 'veil/blocks/content/two.tsx' },
  }),
  e('reasons', 'dusk', 'two', features.ReasonsDuskTwo, { dir: 'features' }),
  e('reasons', 'dusk', 'three', features.ReasonsDuskThree, { dir: 'features' }),
  e('reasons', 'dusk', 'four', features.ReasonsDuskFour, { dir: 'features' }),
  e('reasons', 'dusk', 'five', features.ReasonsDuskFive, { dir: 'features' }),

  // stats
  e('stats', 'mist', 'one', stats.StatsMistOne, { needs: ['stats'] }),
  e('stats', 'mist', 'two', stats.StatsMistTwo, { needs: ['stats'] }),
  e('stats', 'mist', 'three', stats.StatsMistThree, { needs: ['stats'] }),
  e('stats', 'mist', 'four', stats.StatsMistFour, { needs: ['stats'] }),
  e('stats', 'veil', 'one', stats.StatsVeilOne, { needs: ['stats'] }),
  e('stats', 'veil', 'three', stats.StatsVeilThree, { needs: ['stats'] }),
  e('stats', 'veil', 'four', stats.StatsVeilFour, { needs: ['stats'] }),
  e('stats', 'dusk', 'one', stats.StatsDuskOne, { needs: ['stats'] }),
  e('stats', 'dusk', 'two', stats.StatsDuskTwo, { needs: ['stats'] }),

  // testimonials
  ...(
    [
      ['mist', 'one', testimonials.TestimonialsMistOne],
      ['mist', 'two', testimonials.TestimonialsMistTwo],
      ['mist', 'three', testimonials.TestimonialsMistThree],
      ['mist', 'five', testimonials.TestimonialsMistFive],
      ['veil', 'one', testimonials.TestimonialsVeilOne],
      ['veil', 'two', testimonials.TestimonialsVeilTwo],
      ['veil', 'four', testimonials.TestimonialsVeilFour],
      ['dusk', 'one', testimonials.TestimonialsDuskOne],
      ['dusk', 'two', testimonials.TestimonialsDuskTwo],
    ] as const
  ).map(([s, n, C]) => e('testimonials', s, n, C, { needs: ['testimonials'] })),

  // team
  e('team', 'mist', 'one', team.TeamMistOne, { needs: ['team'] }),
  e('team', 'veil', 'one', team.TeamVeilOne, { needs: ['team'] }),
  e('team', 'veil', 'two', team.TeamVeilTwo, { needs: ['team'] }),
  e('team', 'dusk', 'one', team.TeamDuskOne, { needs: ['team'] }),

  // faq
  e('faq', 'mist', 'one', faq.FaqMistOne, { dir: 'faqs', needs: ['faq'] }),
  e('faq', 'mist', 'two', faq.FaqMistTwo, { dir: 'faqs', needs: ['faq'] }),
  e('faq', 'mist', 'three', faq.FaqMistThree, { dir: 'faqs', needs: ['faq'] }),
  e('faq', 'veil', 'one', faq.FaqVeilOne, { dir: 'faqs', needs: ['faq'] }),
  e('faq', 'veil', 'two', faq.FaqVeilTwo, { dir: 'faqs', needs: ['faq'] }),
  e('faq', 'veil', 'four', faq.FaqVeilFour, { dir: 'faqs', needs: ['faq'] }),
  e('faq', 'dusk', 'one', faq.FaqDuskOne, { dir: 'faqs', needs: ['faq'] }),

  // contact
  e('contact', 'mist', 'one', contact.ContactMistOne),
  e('contact', 'veil', 'one', contact.ContactVeilOne),
  e('contact', 'veil', 'two', contact.ContactVeilTwo),

  // call to action
  e('cta', 'mist', 'two', cta.CtaMistTwo, { dir: 'call-to-action' }),
  e('cta', 'mist', 'three', cta.CtaMistThree, { dir: 'call-to-action' }),
  e('cta', 'veil', 'four', cta.CtaVeilFour, { dir: 'call-to-action' }),
  e('cta', 'dusk', 'one', cta.CtaDuskOne, { dir: 'call-to-action' }),
  e('cta', 'dusk', 'two', cta.CtaDuskTwo, { dir: 'call-to-action' }),

  // footer
  e('footer', 'mist', 'one', footer.FooterMistOne),
  e('footer', 'mist', 'two', footer.FooterMistTwo),
  e('footer', 'mist', 'three', footer.FooterMistThree),
  e('footer', 'veil', 'one', footer.FooterVeilOne),
  e('footer', 'veil', 'two', footer.FooterVeilTwo),
  e('footer', 'veil', 'three', footer.FooterVeilThree),
  e('footer', 'veil', 'four', footer.FooterVeilFour),
  e('footer', 'veil', 'five', footer.FooterVeilFive, { folder: true }),
  e('footer', 'veil', 'six', footer.FooterVeilSix, { folder: true }),
  e('footer', 'dusk', 'one', footer.FooterDuskOne),
  e('footer', 'dusk', 'two', footer.FooterDuskTwo),
]
