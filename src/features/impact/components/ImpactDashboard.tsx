import { useMemo } from 'react'
import { MetricCard } from '@/components/data-display'
import { formatCount } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import { useImpactStore } from '../stores/impact.store'
import { useImpactIndex } from '../hooks/useImpactIndex'

interface ImpactDashboardProps {
  className?: string
}

export function ImpactDashboard({ className }: ImpactDashboardProps) {
  const correlations = useImpactStore((state) => state.correlations)
  const scores = useImpactIndex()

  const metrics = useMemo(() => {
    if (!correlations) {
      return {
        affectedFiles: 0,
        highestScore: 0,
        activeCorrelations: 0,
        totalBlast: 0,
      }
    }

    const uniqueFiles = new Set(
      correlations.blastRadii.flatMap((br) =>
        br.affectedNodes.map((n) => n.nodeId),
      ),
    )

    return {
      affectedFiles: uniqueFiles.size,
      highestScore: scores.length > 0 ? scores[0].score : 0,
      activeCorrelations: correlations.matches.length,
      totalBlast: correlations.blastRadii.reduce(
        (sum, br) => sum + br.affectedNodes.length,
        0,
      ),
    }
  }, [correlations, scores])

  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
      <MetricCard
        label="Affected Files"
        value={formatCount(metrics.affectedFiles)}
        hint="Unique files within blast radii"
      />
      <MetricCard
        label="Highest Impact"
        value={`${Math.round(metrics.highestScore * 100)}`}
        hint="Peak composite impact score"
      />
      <MetricCard
        label="Correlations"
        value={formatCount(metrics.activeCorrelations)}
        hint="Active event-to-code matches"
      />
      <MetricCard
        label="Total Blast"
        value={formatCount(metrics.totalBlast)}
        hint="Sum of all affected nodes"
      />
    </div>
  )
}
