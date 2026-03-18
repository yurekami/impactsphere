import { cn } from '@/lib/utils/cn'

interface ProgressProps {
  value: number
  className?: string
}

export function Progress({ value, className }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value))

  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-elevated', className)}>
      <div
        className="h-full rounded-full bg-accent transition-[width] duration-300"
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
