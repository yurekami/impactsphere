import { Badge } from '@/components/ui'
import { cn } from '@/lib/utils/cn'
import { getSeverityColor } from '../lib/globe-config'
import type { GlobeMarker } from '../types'

interface GlobeTooltipProps {
  marker: GlobeMarker | null
  className?: string
}

const SEVERITY_BADGE: Record<string, 'danger' | 'warning' | 'default' | 'neutral'> = {
  critical: 'danger',
  high: 'warning',
  medium: 'default',
  low: 'neutral',
}

export function GlobeTooltip({ marker, className }: GlobeTooltipProps) {
  if (!marker) return null

  const color = getSeverityColor(marker.severity)

  return (
    <div
      className={cn(
        'pointer-events-none w-64 rounded-xl border border-border bg-elevated/95 p-4 shadow-[0_12px_40px_rgb(0_0_0_/_0.5)] backdrop-blur-lg transition-opacity duration-200',
        className,
      )}
    >
      {/* Color bar */}
      <div
        className="mb-3 h-0.5 w-10 rounded-full"
        style={{ backgroundColor: color }}
      />

      <h4 className="mb-1 text-sm font-semibold text-text">{marker.label}</h4>

      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <Badge variant={SEVERITY_BADGE[marker.severity]}>{marker.severity}</Badge>
        <Badge variant="neutral">{marker.category}</Badge>
        <span className="text-xs text-text-muted">
          {marker.eventCount} event{marker.eventCount > 1 ? 's' : ''}
        </span>
      </div>

      {/* Recent event titles */}
      <ul className="space-y-1">
        {marker.events.slice(0, 3).map((event) => (
          <li key={event.guid} className="truncate text-xs text-text-muted">
            {event.title}
          </li>
        ))}
        {marker.events.length > 3 && (
          <li className="text-xs text-accent-soft">
            +{marker.events.length - 3} more
          </li>
        )}
      </ul>
    </div>
  )
}
