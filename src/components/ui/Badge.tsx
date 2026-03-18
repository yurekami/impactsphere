import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'neutral'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantClassNames: Record<BadgeVariant, string> = {
  default: 'bg-accent/20 text-accent-soft border border-accent/35',
  success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  warning: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  danger: 'bg-red-500/15 text-red-300 border border-red-500/30',
  neutral: 'bg-elevated text-text-muted border border-border',
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        variantClassNames[variant],
        className,
      )}
      {...props}
    />
  )
}
