import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text placeholder:text-text-muted/80 outline-none transition focus:border-accent/80 focus:ring-2 focus:ring-accent/20',
          className,
        )}
        {...props}
      />
    )
  },
)

Input.displayName = 'Input'
