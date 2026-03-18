import { Switch } from '@/components/ui'
import { cn } from '@/lib/utils/cn'
import { useImpactStore } from '../stores/impact.store'

interface LiveModeToggleProps {
  className?: string
}

export function LiveModeToggle({ className }: LiveModeToggleProps) {
  const liveMode = useImpactStore((state) => state.liveMode)
  const toggleLiveMode = useImpactStore((state) => state.toggleLiveMode)

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'inline-block h-2 w-2 rounded-full transition-colors',
            liveMode ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]' : 'bg-text-muted/40',
          )}
        />
        <span className="text-sm font-medium text-text">
          Live Mode
        </span>
      </div>
      <Switch checked={liveMode} onCheckedChange={toggleLiveMode} />
    </div>
  )
}
