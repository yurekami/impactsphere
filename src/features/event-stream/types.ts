export type EventCategory =
  | 'security'
  | 'outage'
  | 'regulatory'
  | 'release'
  | 'vulnerability'
  | 'general'

export type Severity = 'critical' | 'high' | 'medium' | 'low'

export interface GeoLocation {
  lat: number
  lng: number
  name: string
}

export interface FeedSource {
  id: string
  name: string
  url: string
  category: string
  isActive: boolean
  lastPolled: string | null
  lastError: string | null
}

export interface RawEvent {
  title: string
  link: string
  description: string
  pubDate: string
  author: string
  categories: string[]
  guid: string
  feedId: string
}

export interface CategorizedEvent extends RawEvent {
  category: EventCategory
  severity: Severity
  location: GeoLocation | null
  extractedKeywords: string[]
}

export interface EventDateRange {
  start: string | null
  end: string | null
}

export interface EventFilter {
  categories: EventCategory[]
  severities: Severity[]
  dateRange: EventDateRange
  search: string
}
