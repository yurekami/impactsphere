import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variantClassNames: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-white hover:bg-accent-soft focus-visible:ring-accent/40',
  secondary:
    'bg-elevated text-text border border-border hover:border-accent/50 hover:text-white',
  ghost: 'bg-transparent text-text-muted hover:bg-elevated hover:text-text',
  danger: 'bg-red-500 text-white hover:bg-red-400 focus-visible:ring-red-500/40',
}

const sizeClassNames: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
          variantClassNames[variant],
          sizeClassNames[size],
          className,
        )}
        {...props}
      />
    )
  },
)

Button.displayName = 'Button'
