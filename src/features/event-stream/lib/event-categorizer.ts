import type { CategorizedEvent, EventCategory, GeoLocation, RawEvent, Severity } from '../types'

const CATEGORY_KEYWORDS: Record<EventCategory, string[]> = {
  security: [
    'breach',
    'attack',
    'threat',
    'malware',
    'ddos',
    'compromise',
    'zero-day',
    'phishing',
    'incident',
  ],
  outage: [
    'outage',
    'degraded',
    'latency',
    'downtime',
    'disruption',
    'interruption',
    'service unavailable',
    'partial outage',
  ],
  regulatory: [
    'regulation',
    'compliance',
    'policy',
    'sanction',
    'directive',
    'law',
    'bill',
    'framework',
  ],
  release: [
    'release',
    'launch',
    'ga',
    'general availability',
    'announces',
    'update',
    'roadmap',
    'preview',
  ],
  vulnerability: [
    'cve-',
    'vulnerability',
    'rce',
    'xss',
    'sql injection',
    'privilege escalation',
    'patch',
    'exploit',
  ],
  general: [],
}

const CRITICAL_KEYWORDS = [
  'critical',
  'actively exploited',
  'remote code execution',
  'rce',
  'wormable',
]

const HIGH_KEYWORDS = ['high severity', 'urgent', 'major', 'widespread', 'severe']
const MEDIUM_KEYWORDS = ['medium', 'moderate', 'important', 'recommended']

const CATEGORY_PRIORITY: EventCategory[] = [
  'vulnerability',
  'security',
  'outage',
  'regulatory',
  'release',
  'general',
]

function contentForMatching(event: RawEvent): string {
  return `${event.title} ${event.description}`.toLowerCase()
}

function keywordHits(content: string, keywords: string[]): string[] {
  return keywords.filter((keyword) => content.includes(keyword))
}

function classifyCategory(event: RawEvent): { category: EventCategory; hits: string[] } {
  const content = contentForMatching(event)

  for (const category of CATEGORY_PRIORITY) {
    if (category === 'general') {
      continue
    }

    const hits = keywordHits(content, CATEGORY_KEYWORDS[category])
    if (hits.length > 0) {
      return { category, hits }
    }
  }

  return { category: 'general', hits: [] }
}

function inferSeverity(event: RawEvent, category: EventCategory, categoryHits: string[]): Severity {
  const content = contentForMatching(event)

  if (content.includes('cve-') && content.includes('rce')) {
    return 'critical'
  }

  if (keywordHits(content, CRITICAL_KEYWORDS).length > 0) {
    return 'critical'
  }

  if (category === 'outage' && /(global|widespread|major|multi-region)/.test(content)) {
    return 'critical'
  }

  if (keywordHits(content, HIGH_KEYWORDS).length > 0) {
    return 'high'
  }

  if (category === 'vulnerability' || category === 'security') {
    return categoryHits.length >= 2 ? 'high' : 'medium'
  }

  if (category === 'outage') {
    return 'high'
  }

  if (category === 'regulatory') {
    return 'medium'
  }

  if (keywordHits(content, MEDIUM_KEYWORDS).length > 0) {
    return 'medium'
  }

  return 'low'
}

function extractKeywords(content: string, category: EventCategory): string[] {
  const matched = new Set<string>()

  for (const keyword of CATEGORY_KEYWORDS[category]) {
    if (content.includes(keyword)) {
      matched.add(keyword)
    }
  }

  for (const keyword of [...CRITICAL_KEYWORDS, ...HIGH_KEYWORDS, ...MEDIUM_KEYWORDS]) {
    if (content.includes(keyword)) {
      matched.add(keyword)
    }
  }

  return Array.from(matched).slice(0, 12)
}

export function categorizeEvent(event: RawEvent, location: GeoLocation | null = null): CategorizedEvent {
  const content = contentForMatching(event)
  const { category, hits } = classifyCategory(event)
  const severity = inferSeverity(event, category, hits)

  return {
    ...event,
    category,
    severity,
    location,
    extractedKeywords: extractKeywords(content, category),
  }
}

export function categorizeEvents(events: RawEvent[]): CategorizedEvent[] {
  return events.map((event) => categorizeEvent(event))
}
