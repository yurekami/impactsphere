import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

interface SliderProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="range"
        className={cn(
          'h-2 w-full cursor-pointer appearance-none rounded-lg bg-elevated accent-accent',
          className,
        )}
        {...props}
      />
    )
  },
)

Slider.displayName = 'Slider'
