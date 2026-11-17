// Blocks adapted from efferd (shabanhr/efferd-ui at d0748f4, MIT, see ../../../NOTICE.md).
// Not ported: auth, logo-cloud, not-found and pricing (not for these sites); call-to-action 5 (a
// newsletter sign-up with stock avatars); form 1 to 3 (workspace, project and account forms, and a
// form with nowhere to send would mislead visitors).
import type { Entry } from '../../registry.ts'
import { ContactBoxes, ContactCard } from './contact.tsx'
import { CtaBand, CtaCorners, CtaRounded, CtaStrip } from './cta.tsx'
import { FaqCard, FaqFramed, FaqGuide, FaqSplit, FaqStack } from './faq.tsx'
import { OfferGrid, ReasonsGrid } from './feature.tsx'
import { FooterCells, FooterColumns, FooterGlow, FooterLight, FooterRuled } from './footer.tsx'
import { GalleryColumns } from './gallery.tsx'
import { HeaderBar, HeaderFloat, HeaderMenu } from './header.tsx'
import { TestimonialsColumns, TestimonialsGrid } from './testimonials.tsx'

const src = (file: string) => ({ lib: 'efferd' as const, file: `registry/blocks/${file}` })

export const efferd: Entry[] = [
  { id: 'efferd/header-1', kind: 'header', source: src('header/1'), component: HeaderBar },
  { id: 'efferd/header-2', kind: 'header', source: src('header/2'), component: HeaderFloat },
  { id: 'efferd/header-3', kind: 'header', source: src('header/3'), component: HeaderMenu },

  { id: 'efferd/offer-1', kind: 'offer', source: src('feature/1'), component: OfferGrid },
  { id: 'efferd/reasons-1', kind: 'reasons', source: src('feature/1'), component: ReasonsGrid },

  {
    id: 'efferd/gallery-1',
    kind: 'gallery',
    source: src('image-gallery/1'),
    component: GalleryColumns,
  },

  {
    id: 'efferd/testimonials-1',
    kind: 'testimonials',
    source: src('testimonials/1'),
    component: TestimonialsColumns,
    needs: ['testimonials'],
  },
  {
    id: 'efferd/testimonials-2',
    kind: 'testimonials',
    source: src('testimonials/2'),
    component: TestimonialsGrid,
    needs: ['testimonials'],
  },

  { id: 'efferd/faq-1', kind: 'faq', source: src('faqs/1'), component: FaqCard, needs: ['faq'] },
  { id: 'efferd/faq-2', kind: 'faq', source: src('faqs/2'), component: FaqSplit, needs: ['faq'] },
  { id: 'efferd/faq-3', kind: 'faq', source: src('faqs/3'), component: FaqGuide, needs: ['faq'] },
  { id: 'efferd/faq-4', kind: 'faq', source: src('faqs/4'), component: FaqStack, needs: ['faq'] },
  { id: 'efferd/faq-5', kind: 'faq', source: src('faqs/5'), component: FaqFramed, needs: ['faq'] },

  { id: 'efferd/contact-1', kind: 'contact', source: src('contact/1'), component: ContactBoxes },
  { id: 'efferd/contact-2', kind: 'contact', source: src('contact/2'), component: ContactCard },

  { id: 'efferd/cta-1', kind: 'cta', source: src('cta/1'), component: CtaStrip },
  { id: 'efferd/cta-2', kind: 'cta', source: src('cta/2'), component: CtaBand },
  { id: 'efferd/cta-3', kind: 'cta', source: src('cta/3'), component: CtaCorners },
  { id: 'efferd/cta-4', kind: 'cta', source: src('cta/4'), component: CtaRounded },

  { id: 'efferd/footer-1', kind: 'footer', source: src('footer/1'), component: FooterRuled },
  { id: 'efferd/footer-2', kind: 'footer', source: src('footer/2'), component: FooterGlow },
  { id: 'efferd/footer-3', kind: 'footer', source: src('footer/3'), component: FooterCells },
  { id: 'efferd/footer-4', kind: 'footer', source: src('footer/4'), component: FooterColumns },
  { id: 'efferd/footer-5', kind: 'footer', source: src('footer/5'), component: FooterLight },
]
