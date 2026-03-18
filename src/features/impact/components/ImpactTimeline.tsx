import { useMemo } from 'react'
import { Timeline, type TimelineItem } from '@/components/data-display'
import { Card, CardHeader, CardTitle } from '@/components/ui'
import { cn } from '@/lib/utils/cn'
import { useImpactStore } from '../stores/impact.store'

interface ImpactTimelineProps {
  className?: string
}

export function ImpactTimeline({ className }: ImpactTimelineProps) {
  const correlations = useImpactStore((state) => state.correlations)

  const timelineItems = useMemo<TimelineItem[]>(() => {
    if (!correlations) {
      return []
    }

    return correlations.matches
      .map((match) => {
        const score = correlations.scores.find(
          (s) => s.matchId === match.id,
        )

        return {
          id: match.id,
          title: `${match.matchType} match \u2192 ${match.nodeId}`,
          description: score
            ? `Impact score: ${Math.round(score.score * 100)} \u2022 Event: ${match.eventId.slice(0, 12)}`
            : `Event: ${match.eventId.slice(0, 12)}`,
          timestamp: correlations.computedAt,
        }
      })
      .slice(0, 20)
  }, [correlations])

  return (
    <Card className={cn('space-y-4', className)}>
      <CardHeader>
        <CardTitle className="text-sm">Impact Timeline</CardTitle>
      </CardHeader>

      {timelineItems.length > 0 ? (
        <Timeline items={timelineItems} />
      ) : (
        <p className="px-5 pb-4 text-sm text-text-muted">No impact events recorded yet.</p>
      )}
    </Card>
  )
}
