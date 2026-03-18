import { Button, Switch } from '@/components/ui'
import { cn } from '@/lib/utils/cn'
import type { EventCategory } from '@/features/event-stream/types'
import { getSeverityColor } from '../lib/globe-config'
import type { GlobeConfig } from '../types'

interface GlobeControlsProps {
  config: GlobeConfig
  onConfigChange: (partial: Partial<GlobeConfig>) => void
  onZoomIn: () => void
  onZoomOut: () => void
  activeCategories: Set<EventCategory>
  allCategories: EventCategory[]
  onToggleCategory: (category: EventCategory) => void
}

const CATEGORY_COLORS: Record<EventCategory, string> = {
  security: getSeverityColor('critical'),
  outage: getSeverityColor('high'),
  regulatory: '#a855f7',
  release: '#22c55e',
  vulnerability: getSeverityColor('medium'),
  general: '#64748b',
}

const CATEGORY_LABELS: Record<EventCategory, string> = {
  security: 'Security',
  outage: 'Outage',
  regulatory: 'Regulatory',
  release: 'Release',
  vulnerability: 'Vulnerability',
  general: 'General',
}

export function GlobeControls({
  config,
  onConfigChange,
  onZoomIn,
  onZoomOut,
  activeCategories,
  allCategories,
  onToggleCategory,
}: GlobeControlsProps) {
  return (
    <div className="pointer-events-auto flex flex-col gap-3">
      {/* Rotation + Zoom */}
      <div className="rounded-xl border border-border bg-elevated/90 p-3.5 shadow-[0_8px_30px_rgb(0_0_0_/_0.35)] backdrop-blur-md">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-text-muted">Auto-rotate</span>
          <Switch
            checked={config.autoRotate}
            onCheckedChange={(v) => onConfigChange({ autoRotate: v })}
          />
        </div>

        <div className="flex gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 font-mono text-base"
            onClick={onZoomIn}
            aria-label="Zoom in"
          >
            +
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 font-mono text-base"
            onClick={onZoomOut}
            aria-label="Zoom out"
          >
            −
          </Button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="rounded-xl border border-border bg-elevated/90 p-3.5 shadow-[0_8px_30px_rgb(0_0_0_/_0.35)] backdrop-blur-md">
        <span className="mb-2.5 block text-xs font-medium text-text-muted">Layers</span>

        <div className="space-y-1.5">
          {allCategories.map((cat) => {
            const active = activeCategories.has(cat)

            return (
              <button
                key={cat}
                type="button"
                onClick={() => onToggleCategory(cat)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition',
                  active
                    ? 'bg-white/5 text-text'
                    : 'text-text-muted/50 line-through opacity-60 hover:opacity-80',
                )}
              >
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: active ? CATEGORY_COLORS[cat] : '#333' }}
                />
                {CATEGORY_LABELS[cat]}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
