import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { cn } from '@/lib/utils/cn'

type ToastVariant = 'info' | 'success' | 'warning' | 'error'

interface ToastItem {
  id: string
  title: string
  message?: string
  variant: ToastVariant
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const variantClassNames: Record<ToastVariant, string> = {
  info: 'border-accent/40',
  success: 'border-emerald-500/40',
  warning: 'border-amber-500/40',
  error: 'border-red-500/40',
}

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = crypto.randomUUID()

    setToasts((prev) => [...prev, { ...toast, id }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id))
    }, 3800)
  }, [])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-96 max-w-[calc(100vw-2rem)] flex-col gap-3">
        {toasts.map((toast) => (
          <article
            key={toast.id}
            className={cn(
              'pointer-events-auto rounded-lg border bg-elevated p-4 shadow-xl',
              variantClassNames[toast.variant],
            )}
          >
            <h3 className="text-sm font-semibold text-text">{toast.title}</h3>
            {toast.message ? (
              <p className="mt-1 text-sm text-text-muted">{toast.message}</p>
            ) : null}
          </article>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used inside ToastProvider')
  }

  return context
}
