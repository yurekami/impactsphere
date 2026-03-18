import { cn } from '@/lib/utils/cn'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

const sizeClassNames = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-[3px]',
} as const

export function LoadingSpinner({
  size = 'md',
  className,
  label = 'Loading',
}: LoadingSpinnerProps) {
  return (
    <div className={cn('inline-flex items-center gap-2 text-text-muted', className)}>
      <span
        aria-hidden="true"
        className={cn(
          'inline-block animate-spin rounded-full border-accent border-t-transparent',
          sizeClassNames[size],
        )}
      />
      <span className="text-sm">{label}</span>
    </div>
  )
}
