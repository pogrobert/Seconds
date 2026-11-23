import { CircleNotchIcon } from '@phosphor-icons/react'
import { cn } from 'cn'

function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <CircleNotchIcon
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn('size-4 animate-[spin_0.75s_linear_infinite]', className)}
      {...props}
    />
  )
}

export { Spinner }
