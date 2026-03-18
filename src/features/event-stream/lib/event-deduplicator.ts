import type { CategorizedEvent, Severity } from '../types'

const STOP_WORDS = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'for',
  'to',
  'of',
  'in',
  'on',
  'at',
  'with',
  'by',
  'from',
  'is',
  'are',
  'was',
  'were',
  'be',
  'has',
  'have',
  'it',
  'its',
  'as',
  'that',
  'this',
  'new',
  'update',
])

const SEVERITY_SCORE: Record<Severity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
}

function normalizeTokens(title: string): Set<string> {
  const normalized = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 1 && !STOP_WORDS.has(part))

  return new Set(normalized)
}

function jaccardSimilarity(left: Set<string>, right: Set<string>): number {
  if (left.size === 0 || right.size === 0) {
    return 0
  }

  let intersection = 0
  for (const token of left) {
    if (right.has(token)) {
      intersection += 1
    }
  }

  const union = left.size + right.size - intersection
  return union === 0 ? 0 : intersection / union
}

function sameDay(pubDateA: string, pubDateB: string): boolean {
  const dayA = new Date(pubDateA)
  const dayB = new Date(pubDateB)

  if (Number.isNaN(dayA.getTime()) || Number.isNaN(dayB.getTime())) {
    return false
  }

  return dayA.toISOString().slice(0, 10) === dayB.toISOString().slice(0, 10)
}

function mergeEvents(primary: CategorizedEvent, duplicate: CategorizedEvent): CategorizedEvent {
  const primaryScore = SEVERITY_SCORE[primary.severity]
  const duplicateScore = SEVERITY_SCORE[duplicate.severity]
  const preferred = duplicateScore > primaryScore ? duplicate : primary
  const secondary = preferred === primary ? duplicate : primary

  return {
    ...preferred,
    extractedKeywords: Array.from(
      new Set([...preferred.extractedKeywords, ...secondary.extractedKeywords]),
    ),
    categories: Array.from(new Set([...preferred.categories, ...secondary.categories])),
    description:
      preferred.description.length >= secondary.description.length
        ? preferred.description
        : secondary.description,
  }
}

export function deduplicateEvents(events: CategorizedEvent[]): CategorizedEvent[] {
  const sorted = [...events].sort(
    (left, right) => new Date(right.pubDate).getTime() - new Date(left.pubDate).getTime(),
  )

  const unique: CategorizedEvent[] = []

  for (const candidate of sorted) {
    const candidateTokens = normalizeTokens(candidate.title)
    const duplicateIndex = unique.findIndex((existing) => {
      if (!sameDay(existing.pubDate, candidate.pubDate)) {
        return false
      }

      const similarity = jaccardSimilarity(candidateTokens, normalizeTokens(existing.title))
      return similarity > 0.8
    })

    if (duplicateIndex === -1) {
      unique.push(candidate)
      continue
    }

    unique[duplicateIndex] = mergeEvents(unique[duplicateIndex], candidate)
  }

  return unique
}
