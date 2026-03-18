import { useCallback, useMemo, useState } from 'react'
import { useEventStreamStore } from '@/features/event-stream/stores/event-stream.store'
import type { EventCategory } from '@/features/event-stream/types'
import type { GlobeMarker } from '../types'

const PROXIMITY_DEG = 2

const ALL_CATEGORIES: EventCategory[] = [
  'security',
  'outage',
  'regulatory',
  'release',
  'vulnerability',
  'general',
]

function proximityKey(lat: number, lng: number): string {
  const rLat = Math.round(lat / PROXIMITY_DEG) * PROXIMITY_DEG
  const rLng = Math.round(lng / PROXIMITY_DEG) * PROXIMITY_DEG
  return `${rLat}:${rLng}`
}

const SEVERITY_RANK: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

export function useGlobeEvents() {
  const events = useEventStreamStore((state) => state.events)
  const [activeCategories, setActiveCategories] = useState<Set<EventCategory>>(
    () => new Set(ALL_CATEGORIES),
  )

  const markers = useMemo<GlobeMarker[]>(() => {
    const geoEvents = events.filter(
      (e) => e.location !== null && activeCategories.has(e.category),
    )

    const groups = new Map<string, typeof geoEvents>()

    for (const event of geoEvents) {
      if (!event.location) continue

      const key = proximityKey(event.location.lat, event.location.lng)
      const group = groups.get(key)

      if (group) {
        group.push(event)
      } else {
        groups.set(key, [event])
      }
    }

    return Array.from(groups.values()).map((groupEvents) => {
      const first = groupEvents[0]
      const loc = first.location!

      const sorted = [...groupEvents].sort(
        (a, b) => (SEVERITY_RANK[a.severity] ?? 3) - (SEVERITY_RANK[b.severity] ?? 3),
      )

      return {
        id: `marker-${loc.lat.toFixed(1)}-${loc.lng.toFixed(1)}`,
        lat: loc.lat,
        lng: loc.lng,
        label: loc.name,
        severity: sorted[0].severity,
        category: sorted[0].category,
        eventCount: groupEvents.length,
        events: groupEvents,
      }
    })
  }, [events, activeCategories])

  const toggleCategory = useCallback((category: EventCategory) => {
    setActiveCategories((prev) => {
      const next = new Set(prev)

      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }

      return next
    })
  }, [])

  return { markers, activeCategories, toggleCategory, allCategories: ALL_CATEGORIES }
}
