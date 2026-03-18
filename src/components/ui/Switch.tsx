import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

interface SwitchProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked: boolean
  onCheckedChange: (next: boolean) => void
}

export function Switch({
  checked,
  onCheckedChange,
  className,
  ...props
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={cn(
        'relative h-6 w-11 rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
        checked
          ? 'border-accent bg-accent/70'
          : 'border-border bg-surface',
        className,
      )}
      onClick={() => onCheckedChange(!checked)}
      {...props}
    >
      <span
        className={cn(
          'absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}
