import type { CategorizedEvent, Severity } from '@/features/event-stream/types'
import type { AlertCondition, AlertRule } from '../types'

const SEVERITY_RANK: Record<Severity, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
}

function matchesKeyword(event: CategorizedEvent, value: string): boolean {
  const needle = value.toLowerCase()
  const titleMatch = event.title.toLowerCase().includes(needle)
  const descriptionMatch = event.description.toLowerCase().includes(needle)

  return titleMatch || descriptionMatch
}

function matchesVendor(event: CategorizedEvent, value: string): boolean {
  const needle = value.toLowerCase()

  return event.extractedKeywords.some(
    (keyword) => keyword.toLowerCase().includes(needle),
  )
}

function matchesSeverity(event: CategorizedEvent, value: string): boolean {
  const threshold = value.toLowerCase() as Severity

  if (!(threshold in SEVERITY_RANK)) {
    return false
  }

  return SEVERITY_RANK[event.severity] >= SEVERITY_RANK[threshold]
}

function matchesImpactScore(_event: CategorizedEvent, value: string): boolean {
  const threshold = Number(value)

  if (Number.isNaN(threshold)) {
    return false
  }

  // Impact score is derived from severity rank (0–3 scale mapped to 0–100)
  const score = (SEVERITY_RANK[_event.severity] / 3) * 100

  return score >= threshold
}

function evaluateCondition(condition: AlertCondition, event: CategorizedEvent): boolean {
  switch (condition.type) {
    case 'keyword':
      return matchesKeyword(event, condition.value)
    case 'vendor':
      return matchesVendor(event, condition.value)
    case 'severity':
      return matchesSeverity(event, condition.value)
    case 'impact-score':
      return matchesImpactScore(event, condition.value)
    default:
      return false
  }
}

export function evaluateRule(rule: AlertRule, event: CategorizedEvent): boolean {
  if (!rule.isActive || rule.conditions.length === 0) {
    return false
  }

  return rule.conditions.every((condition) => evaluateCondition(condition, event))
}
