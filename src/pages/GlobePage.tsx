import { useCallback, useState } from 'react'
import { formatDistanceToNowStrict } from 'date-fns'
import { Badge, Button } from '@/components/ui'
import { cn } from '@/lib/utils/cn'
import { GlobeView } from '@/features/globe/components/GlobeView'
import { GlobeControls } from '@/features/globe/components/GlobeControls'
import { GlobeTooltip } from '@/features/globe/components/GlobeTooltip'
import { useGlobe } from '@/features/globe/hooks/useGlobe'
import { useGlobeEvents } from '@/features/globe/hooks/useGlobeEvents'
import { getSeverityColor } from '@/features/globe/lib/globe-config'
import type { GlobeMarker } from '@/features/globe/types'

const SEVERITY_BADGE_VARIANT = {
  critical: 'danger',
  high: 'warning',
  medium: 'default',
  low: 'neutral',
} as const

export default function GlobePage() {
  const { globeRef, config, updateConfig, focusOnPoint, zoomIn, zoomOut } = useGlobe()
  const { markers, activeCategories, toggleCategory, allCategories } = useGlobeEvents()
  const [hoveredMarker, setHoveredMarker] = useState<GlobeMarker | null>(null)
  const [selectedMarker, setSelectedMarker] = useState<GlobeMarker | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleMarkerClick = useCallback((marker: GlobeMarker) => {
    setSelectedMarker(marker)

    if (!sidebarOpen) {
      setSidebarOpen(true)
    }
  }, [sidebarOpen])

  const handleSidebarEventClick = useCallback(
    (lat: number, lng: number) => {
      focusOnPoint(lat, lng)
    },
    [focusOnPoint],
  )

  const recentEvents = markers
    .flatMap((m) => m.events.map((e) => ({ ...e, markerLat: m.lat, markerLng: m.lng })))
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .slice(0, 30)

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#050508]">
      {/* Globe — full viewport */}
      <div className="absolute inset-0">
        <GlobeView
          markers={markers}
          config={config}
          globeRef={globeRef}
          onMarkerClick={handleMarkerClick}
          onMarkerHover={setHoveredMarker}
        />
      </div>

      {/* Vignette overlay for depth */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(5,5,8,0.7) 100%)',
        }}
      />

      {/* Top-left title */}
      <div className="pointer-events-none absolute left-5 top-5 z-10">
        <h1 className="text-lg font-semibold tracking-tight text-text">
          Globe
        </h1>
        <p className="mt-0.5 text-xs text-text-muted">
          {markers.length} active region{markers.length !== 1 ? 's' : ''} tracked
        </p>
      </div>

      {/* Bottom-left controls */}
      <div className="absolute bottom-5 left-5 z-10 pointer-events-none">
        <GlobeControls
          config={config}
          onConfigChange={updateConfig}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          activeCategories={activeCategories}
          allCategories={allCategories}
          onToggleCategory={toggleCategory}
        />
      </div>

      {/* Tooltip — fixed position near top-center */}
      <div className="absolute left-1/2 top-5 z-20 -translate-x-1/2">
        <GlobeTooltip marker={hoveredMarker} />
      </div>

      {/* Sidebar toggle */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-4 top-5 z-20 bg-elevated/60 backdrop-blur-md"
        onClick={() => setSidebarOpen((v) => !v)}
      >
        {sidebarOpen ? '›' : '‹'} Events
      </Button>

      {/* Collapsible right sidebar */}
      <aside
        className={cn(
          'absolute right-0 top-0 z-10 flex h-full w-80 flex-col border-l border-border bg-elevated/90 backdrop-blur-lg transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-text">Recent Events</h2>
          {selectedMarker && (
            <button
              type="button"
              className="text-xs text-accent-soft hover:text-accent transition"
              onClick={() => setSelectedMarker(null)}
            >
              Clear filter
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {(selectedMarker ? selectedMarker.events : recentEvents).map((event) => {
            const lat = 'markerLat' in event ? (event as typeof recentEvents[number]).markerLat : selectedMarker?.lat
            const lng = 'markerLng' in event ? (event as typeof recentEvents[number]).markerLng : selectedMarker?.lng

            return (
              <button
                key={event.guid}
                type="button"
                className="group w-full rounded-lg border border-border bg-surface/50 p-3 text-left transition hover:border-accent/40 hover:bg-elevated"
                onClick={() => {
                  if (lat !== undefined && lng !== undefined) {
                    handleSidebarEventClick(lat, lng)
                  }
                }}
              >
                <div className="mb-1.5 flex items-center gap-1.5">
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: getSeverityColor(event.severity) }}
                  />
                  <Badge variant={SEVERITY_BADGE_VARIANT[event.severity]} className="text-[10px] px-1.5 py-0.5">
                    {event.severity}
                  </Badge>
                  <Badge variant="neutral" className="text-[10px] px-1.5 py-0.5">
                    {event.category}
                  </Badge>
                </div>

                <p className="line-clamp-2 text-xs font-medium leading-snug text-text">
                  {event.title}
                </p>

                <span className="mt-1 block text-[10px] text-text-muted">
                  {formatTimeSafe(event.pubDate)}
                </span>
              </button>
            )
          })}

          {markers.length === 0 && (
            <div className="flex h-40 items-center justify-center text-center text-xs text-text-muted">
              No geolocated events yet.
              <br />
              Events with location data will appear here.
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}

function formatTimeSafe(pubDate: string): string {
  const d = new Date(pubDate)

  if (Number.isNaN(d.getTime())) {
    return 'unknown'
  }

  return formatDistanceToNowStrict(d, { addSuffix: true })
}
