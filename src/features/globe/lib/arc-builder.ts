import type { GlobeArc, GlobeMarker } from '../types'
import { getSeverityColor } from './globe-config'

const MAX_TIME_DIFF_MS = 60 * 60 * 1000

function latestEventTime(marker: GlobeMarker): number {
  let max = 0

  for (const event of marker.events) {
    const t = new Date(event.pubDate).getTime()

    if (t > max) {
      max = t
    }
  }

  return max
}

export function buildArcs(markers: GlobeMarker[]): GlobeArc[] {
  const arcs: GlobeArc[] = []
  const byCategory = new Map<string, GlobeMarker[]>()

  for (const marker of markers) {
    const group = byCategory.get(marker.category)

    if (group) {
      group.push(marker)
    } else {
      byCategory.set(marker.category, [marker])
    }
  }

  for (const categoryMarkers of byCategory.values()) {
    if (categoryMarkers.length < 2) {
      continue
    }

    const sorted = [...categoryMarkers].sort(
      (a, b) => latestEventTime(a) - latestEventTime(b),
    )

    for (let i = 0; i < sorted.length - 1; i++) {
      const a = sorted[i]
      const b = sorted[i + 1]

      if (Math.abs(latestEventTime(b) - latestEventTime(a)) <= MAX_TIME_DIFF_MS) {
        arcs.push({
          startLat: a.lat,
          startLng: a.lng,
          endLat: b.lat,
          endLng: b.lng,
          color: getSeverityColor(a.severity),
          label: `${a.label} → ${b.label}`,
        })
      }
    }
  }

  return arcs
}
