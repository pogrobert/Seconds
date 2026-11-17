// Blocks adapted from Shadcn UI Blocks (akash3444/shadcn-ui-blocks, commit 73a69e9; MIT, see
// ../../../NOTICE.md). Each file names the source blocks it ports.
import type { Entry, Kind } from '../../registry.ts'
import { Contact02 } from './contact.tsx'
import { Cta02, Cta03, Cta04, Cta05, Cta06, Cta07 } from './cta.tsx'
import { Faq01, Faq02, Faq03, Faq06, Faq07, Faq08, Faq09, Faq10, Faq14 } from './faq.tsx'
import {
  Features03,
  Features04,
  Features05,
  Features11,
  Features12,
  Features14,
  Features17,
  Features18,
  Features19,
} from './features.tsx'
import { Footer01, Footer02, Footer03, Footer04, Footer05 } from './footer.tsx'
import { Gallery01, Gallery02 } from './gallery.tsx'
import { Header01, Header02, Header03, Header04 } from './header.tsx'
import { Hero01, Hero02, Hero03, Hero04, Hero05, Hero06, Hero07, Hero08 } from './hero.tsx'
import { Stats10 } from './stats.tsx'
import { Team03, Team04, Team05, Team10 } from './team.tsx'
import {
  Testimonials01,
  Testimonials02,
  Testimonials03,
  Testimonials04,
  Testimonials05,
  Testimonials06,
  Testimonials07,
  Testimonials08,
  Testimonials11,
} from './testimonials.tsx'

/** One entry: `kind`, the name in our id, the source folder, the component, and extras. */
const e = (
  kind: Kind,
  name: string,
  src: string,
  component: Entry['component'],
  extra: Partial<Entry> = {},
): Entry => ({
  id: `shadcnui/${kind}-${name}`,
  kind,
  source: { lib: 'shadcnui-blocks', file: `src/registry/blocks/radix/${src}` },
  component,
  ...extra,
})

const own = { includesHeader: true }
const faq = { needs: ['faq' as const] }
const said = { needs: ['testimonials' as const] }
const team = { needs: ['team' as const] }
const stats = { needs: ['stats' as const] }

export const shadcnui: Entry[] = [
  e('header', '01', 'navbar-01', Header01),
  e('header', '02', 'navbar-02', Header02),
  e('header', '03', 'navbar-03', Header03),
  e('header', '04', 'navbar-04', Header04),

  e('hero', '01', 'hero-01', Hero01),
  e('hero', '02', 'hero-02', Hero02),
  e('hero', '03', 'hero-03', Hero03, own),
  e('hero', '04', 'hero-04', Hero04),
  e('hero', '05', 'hero-05', Hero05),
  e('hero', '06', 'hero-06', Hero06),
  e('hero', '07', 'hero-07', Hero07),
  e('hero', '08', 'hero-08', Hero08, own),

  e('offer', 'features-03', 'features-03', Features03),
  e('offer', 'features-11', 'features-11', Features11),
  e('offer', 'features-17', 'features-17', Features17),
  e('offer', 'features-18', 'features-18', Features18),
  e('offer', 'features-19', 'features-19', Features19),

  e('reasons', 'features-04', 'features-04', Features04),
  e('reasons', 'features-05', 'features-05', Features05),
  e('reasons', 'features-12', 'features-12', Features12),
  e('reasons', 'features-14', 'features-14', Features14),

  e('gallery', 'carousel-01', 'carousel-block-01', Gallery01),
  e('gallery', 'carousel-02', 'carousel-block-02', Gallery02),

  e('stats', '10', 'stats-10', Stats10, stats),

  e('testimonials', '01', 'testimonials-01', Testimonials01, said),
  e('testimonials', '02', 'testimonials-02', Testimonials02, said),
  e('testimonials', '03', 'testimonials-03', Testimonials03, said),
  e('testimonials', '04', 'testimonials-04', Testimonials04, said),
  e('testimonials', '05', 'testimonials-05', Testimonials05, said),
  e('testimonials', '06', 'testimonials-06', Testimonials06, said),
  e('testimonials', '07', 'testimonials-07', Testimonials07, said),
  e('testimonials', '08', 'testimonials-08', Testimonials08, said),
  e('testimonials', '11', 'testimonials-11', Testimonials11, said),

  e('team', '03', 'team-03', Team03, team),
  e('team', '04', 'team-04', Team04, team),
  e('team', '05', 'team-05', Team05, team),
  e('team', '10', 'team-10', Team10, team),

  e('faq', '01', 'faq-01', Faq01, faq),
  e('faq', '02', 'faq-02', Faq02, faq),
  e('faq', '03', 'faq-03', Faq03, faq),
  e('faq', '06', 'faq-06', Faq06, faq),
  e('faq', '07', 'faq-07', Faq07, faq),
  e('faq', '08', 'faq-08', Faq08, faq),
  e('faq', '09', 'faq-09', Faq09, faq),
  e('faq', '10', 'faq-10', Faq10, faq),
  e('faq', '14', 'faq-14', Faq14, faq),

  e('contact', '02', 'contact-02', Contact02),

  e('cta', '02', 'cta-02', Cta02),
  e('cta', '03', 'cta-03', Cta03),
  e('cta', '04', 'cta-04', Cta04),
  e('cta', '05', 'cta-05', Cta05),
  e('cta', '06', 'cta-06', Cta06),
  e('cta', '07', 'cta-07', Cta07),

  e('footer', '01', 'footer-01', Footer01),
  e('footer', '02', 'footer-02', Footer02),
  e('footer', '03', 'footer-03', Footer03),
  e('footer', '04', 'footer-04', Footer04),
  e('footer', '05', 'footer-05', Footer05),
]
