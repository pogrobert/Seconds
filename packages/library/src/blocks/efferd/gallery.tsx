// Photos in columns of different heights. Adapted from efferd (MIT, see ../../../NOTICE.md):
// image-gallery 1. The random stock pictures and the script-driven lazy loader are replaced by
// the business's own five photos; the last photo in each column stretches so the columns end level.

import { type BlockProps, Img, type Photo } from '../../ui.tsx'

// image-gallery 1's lazy image fade: each photo fades in as it comes into view (motion.ts).
const Frame = (p: { photo: Photo; className: string }) => (
  <div
    data-m="reveal"
    className={`bg-muted overflow-hidden rounded-(--radius) border ${p.className}`}
  >
    <Img photo={p.photo} />
  </div>
)

/** Three columns of framed photos (efferd image-gallery 1). */
export function GalleryColumns({ c }: BlockProps) {
  const ph = c.photos
  return (
    <section className="px-4 py-16">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
        <div className="flex flex-col gap-4 md:gap-6">
          <Frame photo={ph.d1} className="aspect-[3/4]" />
          <Frame photo={ph.about} className="aspect-[4/3] md:aspect-auto md:min-h-48 md:flex-1" />
        </div>
        <div className="flex flex-col gap-4 md:gap-6">
          <Frame photo={ph.d2} className="aspect-[4/3]" />
          <Frame photo={ph.cta} className="aspect-[3/4] md:aspect-auto md:min-h-48 md:flex-1" />
        </div>
        <div className="flex flex-col gap-4 sm:col-span-2 md:col-span-1 md:gap-6">
          <Frame photo={ph.hero} className="aspect-[4/3] md:aspect-auto md:min-h-48 md:flex-1" />
        </div>
      </div>
    </section>
  )
}
