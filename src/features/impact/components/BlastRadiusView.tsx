import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui'
import { cn } from '@/lib/utils/cn'
import { formatCount } from '@/lib/utils/format'
import type { BlastRadius } from '../types'

interface BlastRadiusViewProps {
  blastRadius: BlastRadius
  className?: string
}

const DISTANCE_COLORS: Record<number, { bg: string; text: string; label: string }> = {
  0: { bg: 'bg-red-500/15', text: 'text-red-400', label: 'Root' },
  1: { bg: 'bg-orange-500/15', text: 'text-orange-400', label: 'Direct' },
  2: { bg: 'bg-amber-500/15', text: 'text-amber-300', label: 'Secondary' },
  3: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', label: 'Tertiary' },
}

function getDistanceStyle(distance: number) {
  return DISTANCE_COLORS[distance] ?? {
    bg: 'bg-elevated',
    text: 'text-text-muted',
    label: `Depth ${distance}`,
  }
}

export function BlastRadiusView({ blastRadius, className }: BlastRadiusViewProps) {
  const grouped = useMemo(() => {
    const groups = new Map<number, string[]>()

    for (const node of blastRadius.affectedNodes) {
      const existing = groups.get(node.distance) ?? []
      existing.push(node.nodeId)
      groups.set(node.distance, existing)
    }

    return Array.from(groups.entries())
      .sort(([a], [b]) => a - b)
  }, [blastRadius])

  return (
    <Card className={cn('space-y-4', className)}>
      <CardHeader>
        <CardTitle className="text-sm">Blast Radius</CardTitle>
        <div className="flex gap-3 text-xs text-text-muted">
          <span>{formatCount(blastRadius.totalFiles)} files</span>
          <span>{formatCount(blastRadius.totalFunctions)} functions</span>
          <span>Depth {blastRadius.maxDepth}</span>
        </div>
      </CardHeader>

      <CardContent>
        {grouped.map(([distance, nodeIds]) => {
          const style = getDistanceStyle(distance)

          return (
            <div key={distance} className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge
                  className={cn(style.bg, style.text, 'border-0')}
                >
                  {style.label}
                </Badge>
                <span className="text-xs text-text-muted">
                  {nodeIds.length} node{nodeIds.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 pl-2">
                {nodeIds.map((nodeId) => (
                  <span
                    key={nodeId}
                    className={cn(
                      'inline-block max-w-56 truncate rounded px-2 py-0.5 font-mono text-xs',
                      style.bg,
                      style.text,
                    )}
                    title={nodeId}
                  >
                    {nodeId}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
