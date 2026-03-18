import {
  cloneElement,
  isValidElement,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/utils/cn'

interface TooltipProps {
  content: ReactNode
  children: ReactElement
  className?: string
}

export function Tooltip({ content, children, className }: TooltipProps) {
  const [visible, setVisible] = useState(false)

  if (!isValidElement(children)) {
    return null
  }

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {cloneElement(children)}
      {visible ? (
        <span
          role="tooltip"
          className={cn(
            'pointer-events-none absolute -top-10 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-elevated px-2 py-1 text-xs text-text-muted shadow-lg',
            className,
          )}
        >
          {content}
        </span>
      ) : null}
    </span>
  )
}
