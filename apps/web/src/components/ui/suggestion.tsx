// Suggestion: one-click prompts under a reply. Written in the shape of the "Suggestion" pattern of
// shadcn/ui's AI Elements (MIT, github.com/shadcn-ui/ui), which is copied in rather than
// installed: a row of outline buttons that scrolls sideways when it overflows, fading the edge
// that has more.
import { cn } from 'cn'
import type * as React from 'react'
import { Button } from '@/components/ui/button'

function Suggestions({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="suggestions"
      className={cn(
        'flex scroll-fade-x no-scrollbar gap-2 overflow-x-auto overscroll-x-contain',
        className,
      )}
      {...props}
    />
  )
}

function Suggestion({
  suggestion,
  onClick,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Button>, 'onClick'> & {
  suggestion: string
  onClick?: (suggestion: string) => void
}) {
  return (
    <Button
      data-slot="suggestion"
      variant="outline"
      size="sm"
      className={cn('shrink-0 rounded-full px-3', className)}
      onClick={() => onClick?.(suggestion)}
      {...props}
    >
      {children ?? suggestion}
    </Button>
  )
}

export { Suggestion, Suggestions }
