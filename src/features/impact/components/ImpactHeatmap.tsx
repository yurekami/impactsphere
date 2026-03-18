import { useMemo } from 'react'
import { Card, CardHeader, CardTitle } from '@/components/ui'
import { cn } from '@/lib/utils/cn'
import { useImpactStore } from '../stores/impact.store'

interface ImpactHeatmapProps {
  className?: string
}

interface HeatmapEntry {
  nodeId: string
  score: number
  matchCount: number
}

function scoreColor(score: number): string {
  if (score >= 0.8) return 'text-red-400'
  if (score >= 0.6) return 'text-orange-400'
  if (score >= 0.4) return 'text-amber-300'
  if (score >= 0.2) return 'text-emerald-400'
  return 'text-text-muted'
}

function scoreBg(score: number): string {
  if (score >= 0.8) return 'bg-red-500/10'
  if (score >= 0.6) return 'bg-orange-500/10'
  if (score >= 0.4) return 'bg-amber-500/10'
  if (score >= 0.2) return 'bg-emerald-500/10'
  return 'bg-elevated'
}

export function ImpactHeatmap({ className }: ImpactHeatmapProps) {
  const correlations = useImpactStore((state) => state.correlations)

  const topComponents = useMemo<HeatmapEntry[]>(() => {
    if (!correlations) {
      return []
    }

    const nodeScores = new Map<string, { total: number; count: number }>()

    for (const match of correlations.matches) {
      const score = correlations.scores.find((s) => s.matchId === match.id)
      const existing = nodeScores.get(match.nodeId) ?? { total: 0, count: 0 }
      existing.total += score?.score ?? 0
      existing.count += 1
      nodeScores.set(match.nodeId, existing)
    }

    return Array.from(nodeScores.entries())
      .map(([nodeId, data]) => ({
        nodeId,
        score: data.count > 0 ? data.total / data.count : 0,
        matchCount: data.count,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
  }, [correlations])

  return (
    <Card className={cn('space-y-4', className)}>
      <CardHeader>
        <CardTitle className="text-sm">Top Impacted Components</CardTitle>
      </CardHeader>

      {topComponents.length === 0 ? (
        <p className="px-5 pb-4 text-sm text-text-muted">No components impacted yet.</p>
      ) : (
        <div className="space-y-2 px-5 pb-4">
          {topComponents.map((entry, index) => (
            <div
              key={entry.nodeId}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2',
                scoreBg(entry.score),
              )}
            >
              <span className="w-5 text-center text-xs font-semibold text-text-muted">
                {index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <p
                  className="truncate font-mono text-xs text-text"
                  title={entry.nodeId}
                >
                  {entry.nodeId}
                </p>
              </div>

              <span className={cn('text-sm font-semibold tabular-nums', scoreColor(entry.score))}>
                {Math.round(entry.score * 100)}
              </span>

              <span className="text-xs text-text-muted">
                {entry.matchCount} match{entry.matchCount !== 1 ? 'es' : ''}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
