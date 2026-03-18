import {
  useEffect,
  useMemo,
  useState,
  type MouseEvent,
  type PropsWithChildren,
} from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils/cn'

interface ModalProps extends PropsWithChildren {
  open: boolean
  onClose: () => void
  title?: string
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  const content = useMemo(() => {
    if (!open) {
      return null
    }

    const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onClose()
      }
    }

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        onClick={handleBackdropClick}
      >
        <div
          className={cn(
            'w-full max-w-lg rounded-xl border border-border bg-elevated p-6 shadow-2xl',
            'animate-[modal-enter_220ms_ease-out]',
          )}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          {title ? <h2 className="mb-3 text-lg font-semibold text-text">{title}</h2> : null}
          {children}
        </div>
      </div>
    )
  }, [children, onClose, open, title])

  if (!mounted || !content) {
    return null
  }

  return createPortal(content, document.body)
}
