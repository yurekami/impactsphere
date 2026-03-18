import type { CategorizedEvent } from '@/features/event-stream/types'
import type { ImpactScore, Match } from '@/features/impact/types'

const MAX_CONTEXT_CHARS = 4000

function severityWeight(severity: string): number {
  const weights: Record<string, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  }
  return weights[severity] ?? 0
}

function formatEvent(event: CategorizedEvent, index: number): string {
  return [
    `${index + 1}. **${event.title}**`,
    `   - Severity: ${event.severity} | Category: ${event.category}`,
    `   - Date: ${event.pubDate}`,
    event.description ? `   - ${event.description.slice(0, 120)}` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

function formatMatch(
  match: Match,
  score: ImpactScore | undefined,
): string {
  const scoreLabel = score ? ` (score: ${score.score.toFixed(2)})` : ''
  return `- Node \`${match.nodeId}\` ← Event \`${match.eventId}\` [${match.matchType}, confidence: ${match.confidence.toFixed(2)}]${scoreLabel}`
}

export function buildContext(
  events: CategorizedEvent[],
  scores: ImpactScore[],
  matches: Match[],
): string {
  const sortedEvents = [...events]
    .sort((a, b) => severityWeight(b.severity) - severityWeight(a.severity))
    .slice(0, 10)

  const scoreMap = new Map(scores.map((s) => [s.matchId, s]))

  const sortedMatches = [...matches]
    .sort((a, b) => {
      const sa = scoreMap.get(a.id)?.score ?? 0
      const sb = scoreMap.get(b.id)?.score ?? 0
      return sb - sa
    })
    .slice(0, 15)

  const criticalCount = events.filter((e) => e.severity === 'critical').length
  const highCount = events.filter((e) => e.severity === 'high').length
  const avgScore =
    scores.length > 0
      ? scores.reduce((sum, s) => sum + s.score, 0) / scores.length
      : 0

  const sections: string[] = [
    '## Active Events',
    '',
    sortedEvents.length > 0
      ? sortedEvents.map(formatEvent).join('\n\n')
      : '_No active events._',
    '',
    '## Affected Components',
    '',
    sortedMatches.length > 0
      ? sortedMatches.map((m) => formatMatch(m, scoreMap.get(m.id))).join('\n')
      : '_No matched components._',
    '',
    '## Risk Summary',
    '',
    `- Total events: ${events.length}`,
    `- Critical: ${criticalCount} | High: ${highCount}`,
    `- Matched components: ${matches.length}`,
    `- Average impact score: ${avgScore.toFixed(2)}`,
  ]

  const full = sections.join('\n')

  if (full.length <= MAX_CONTEXT_CHARS) {
    return full
  }

  return full.slice(0, MAX_CONTEXT_CHARS - 3) + '...'
}
