// The first blocks, adapted from Tailark by hand (see the header of each file).
import type { Entry } from '../../registry.ts'
import { HeroCard, HeroCover, HeroPlate, HeroSplit, HeroStack } from './hero.tsx'
import {
  AboutBand,
  AboutColumn,
  AboutSplit,
  CtaCard,
  CtaCentre,
  CtaPhoto,
  FooterLarge,
  FooterSimple,
  GalleryMosaic,
  GalleryPair,
  OfferCards,
  OfferList,
  OfferPhoto,
  ReasonsBand,
  ReasonsColumns,
  Visit,
} from './sections.tsx'

const t = (file: string) => ({ lib: 'core' as const, file })
const hero = { includesHeader: true }

export const core: Entry[] = [
  {
    id: 'core/hero-plate',
    kind: 'hero',
    source: t('mist/blocks/hero-section/two'),
    component: HeroPlate,
    ...hero,
  },
  {
    id: 'core/hero-stack',
    kind: 'hero',
    source: t('mist/blocks/hero-section/six.tsx'),
    component: HeroStack,
    ...hero,
  },
  {
    id: 'core/hero-split',
    kind: 'hero',
    source: t('(own, Tailark tokens)'),
    component: HeroSplit,
    ...hero,
  },
  {
    id: 'core/hero-cover',
    kind: 'hero',
    source: t('(own, Tailark tokens)'),
    component: HeroCover,
    ...hero,
  },
  {
    id: 'core/hero-card',
    kind: 'hero',
    source: t('veil/blocks/call-to-action/two.tsx'),
    component: HeroCard,
    ...hero,
  },
  {
    id: 'core/about-column',
    kind: 'about',
    source: t('mist/blocks/content/three.tsx'),
    component: AboutColumn,
  },
  {
    id: 'core/about-split',
    kind: 'about',
    source: t('(own, Tailark tokens)'),
    component: AboutSplit,
  },
  {
    id: 'core/about-band',
    kind: 'about',
    source: t('mist/blocks/content/four.tsx'),
    component: AboutBand,
  },
  {
    id: 'core/offer-cards',
    kind: 'offer',
    source: t('mist/blocks/features/two.tsx'),
    component: OfferCards,
  },
  {
    id: 'core/offer-list',
    kind: 'offer',
    source: t('(own, Tailark tokens)'),
    component: OfferList,
  },
  {
    id: 'core/offer-photo',
    kind: 'offer',
    source: t('(own, Tailark tokens)'),
    component: OfferPhoto,
  },
  {
    id: 'core/reasons-columns',
    kind: 'reasons',
    source: t('(own, Tailark tokens)'),
    component: ReasonsColumns,
  },
  {
    id: 'core/reasons-band',
    kind: 'reasons',
    source: t('(own, Tailark tokens)'),
    component: ReasonsBand,
  },
  {
    id: 'core/gallery-mosaic',
    kind: 'gallery',
    source: t('(own, Tailark tokens)'),
    component: GalleryMosaic,
  },
  {
    id: 'core/gallery-pair',
    kind: 'gallery',
    source: t('(own, Tailark tokens)'),
    component: GalleryPair,
  },
  {
    id: 'core/contact-visit',
    kind: 'contact',
    source: t('(own, Tailark tokens)'),
    component: Visit,
  },
  {
    id: 'core/cta-centre',
    kind: 'cta',
    source: t('mist/blocks/call-to-action/one.tsx'),
    component: CtaCentre,
  },
  {
    id: 'core/cta-card',
    kind: 'cta',
    source: t('veil/blocks/call-to-action/two.tsx'),
    component: CtaCard,
  },
  { id: 'core/cta-photo', kind: 'cta', source: t('(own, Tailark tokens)'), component: CtaPhoto },
  {
    id: 'core/footer-simple',
    kind: 'footer',
    source: t('mist/blocks/footer/four.tsx'),
    component: FooterSimple,
  },
  {
    id: 'core/footer-large',
    kind: 'footer',
    source: t('(own, Tailark tokens)'),
    component: FooterLarge,
  },
]
