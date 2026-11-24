import sans from '@fontsource-variable/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-wght-normal.woff2?url'
import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import { MotionConfig } from 'motion/react'
import type { ReactNode } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Seconds' },
    ],
    links: [
      // Atkinson Hyperlegible Next, the build page's own type, comes with the stylesheet (styles.css);
      // the sites it draws load their own fonts.
      // The font asked for at once, beside the stylesheet: found only through the stylesheet, it
      // arrived after the first paint and the text shifted when it swapped in (2026-11-23).
      { rel: 'preload', href: sans, as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: appCss },
      // PNGs drawn from public/icon.svg in Chromium: Safari draws the SVG's blurs and grain
      // coarsely, and its dark tile vanished into the dark page (iPhone, 2026-11-24).
      { rel: 'icon', href: '/icon-48.png', type: 'image/png', sizes: '48x48' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
    ],
  }),
  shellComponent: RootDocument,
  component: Outlet,
})

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {/* "Reduce motion" keeps Motion's fades and drops its movement. */}
        <MotionConfig reducedMotion="user">
          {/* No hoverable tooltips: they wait for the pointer to move on before closing, and a
              pointer that goes into the preview's frame never tells this page it moved. */}
          <TooltipProvider delayDuration={300} disableHoverableContent>
            {children}
          </TooltipProvider>
        </MotionConfig>
        <Scripts />
      </body>
    </html>
  )
}
