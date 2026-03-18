import { Card } from '@/components/ui'
import { ScoreBadge } from '@/components/data-display'
import { cn } from '@/lib/utils/cn'
import type { Match, ImpactScore, BlastRadius } from '../types'

interface ImpactScoreCardProps {
  match: Match
  score: ImpactScore
  blastRadius: BlastRadius | undefined
  eventTitle: string
  nodePath: string
  className?: string
}

export function ImpactScoreCard({
  match,
  score,
  blastRadius,
  eventTitle,
  nodePath,
  className,
}: ImpactScoreCardProps) {
  return (
    <Card
      className={cn(
        'space-y-3 border-l-2 transition-colors hover:border-accent/60',
        score.score >= 0.8
          ? 'border-l-red-500/70'
          : score.score >= 0.5
            ? 'border-l-amber-500/70'
            : 'border-l-emerald-500/70',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-text">{eventTitle}</p>
          <p className="mt-1 truncate text-xs text-text-muted">{nodePath}</p>
        </div>
        <ScoreBadge score={score.score} />
      </div>

      <div className="flex items-center gap-4 text-xs text-text-muted">
        <span className="rounded bg-elevated px-2 py-0.5 font-mono">
          {match.matchType}
        </span>
        <span>
          Confidence: {Math.round(match.confidence * 100)}%
        </span>
        {blastRadius ? (
          <span>
            Blast: {blastRadius.affectedNodes.length} nodes
          </span>
        ) : null}
      </div>
    </Card>
  )
}
