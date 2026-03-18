import type { CategorizedEvent, EventCategory, Severity } from '@/features/event-stream/types'

export interface GlobeMarker {
  id: string
  lat: number
  lng: number
  label: string
  severity: Severity
  category: EventCategory
  eventCount: number
  events: CategorizedEvent[]
}

export interface GlobeArc {
  startLat: number
  startLng: number
  endLat: number
  endLng: number
  color: string
  label: string
}

export interface GlobeConfig {
  autoRotate: boolean
  markerScale: number
  showLabels: boolean
}
