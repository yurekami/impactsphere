import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { useAlerts } from '../hooks/useAlerts'

export function AlertBanner() {
  const { activeCount } = useAlerts()
  const [isDismissed, setIsDismissed] = useState(false)

  if (activeCount === 0 || isDismissed) {
    return null
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2',
      )}
    >
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
        </span>
        <p className="text-sm font-medium text-red-300">
          {activeCount} active alert{activeCount !== 1 ? 's' : ''} require attention
        </p>
      </div>

      <button
        type="button"
        onClick={() => setIsDismissed(true)}
        className="text-xs text-red-300/70 transition hover:text-red-200"
      >
        Dismiss
      </button>
    </div>
  )
}
