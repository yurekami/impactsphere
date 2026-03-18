import type Graph from 'graphology'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui'
import { cn } from '@/lib/utils/cn'
import type { SimulationResult } from '../types'
import { countConnectedComponents } from '../lib/scenario-engine'

interface DiffComparisonProps {
  graph: Graph
  result: SimulationResult
}

interface StatRowProps {
  label: string
  healthy: number
  impacted: number
}

function StatRow({ label, healthy, impacted }: StatRowProps) {
  const delta = impacted - healthy
  const pctChange = healthy > 0 ? Math.round((delta / healthy) * 100) : 0
  const isWorse = delta < 0 || (label === 'Components' && delta > 0)

  return (
    <div className="grid grid-cols-[1fr_80px_80px_90px] items-center gap-2 py-2 text-sm border-b border-border/50 last:border-b-0">
      <span className="text-text-muted">{label}</span>
      <span className="text-right font-mono text-emerald-400">
        {healthy.toLocaleString()}
      </span>
      <span
        className={cn(
          'text-right font-mono',
          isWorse ? 'text-red-400' : 'text-emerald-400',
        )}
      >
        {impacted.toLocaleString()}
      </span>
      <span
        className={cn(
          'text-right font-mono text-xs',
          isWorse ? 'text-red-400' : 'text-emerald-400',
        )}
      >
        {delta === 0 ? '—' : `${delta > 0 ? '+' : ''}${delta} (${pctChange > 0 ? '+' : ''}${pctChange}%)`}
      </span>
    </div>
  )
}

export function DiffComparison({ graph, result }: DiffComparisonProps) {
  const healthyNodes = graph.order
  const healthyEdges = graph.size
  const healthyComponents = countConnectedComponents(graph)

  const impactedNodes = healthyNodes - result.totalAffected
  // Rebuild impacted edge count by replaying the scenario on a copy.
  // We already have totalAffected, so we estimate edges removed proportionally.
  const impactedGraph = graph.copy()

  for (const step of result.cascadeSteps) {
    for (const nodeId of step.removedNodes) {
      if (impactedGraph.hasNode(nodeId)) {
        impactedGraph.dropNode(nodeId)
      }
    }
  }

  const impactedEdges = impactedGraph.size
  const impactedComponents = countConnectedComponents(impactedGraph)

  return (
    <Card>
      <CardTitle>Impact Diff</CardTitle>
      <CardDescription className="mt-1">
        Healthy vs. post-scenario graph
      </CardDescription>

      <CardContent className="mt-4">
        {/* Column headers */}
        <div className="grid grid-cols-[1fr_80px_80px_90px] gap-2 pb-2 text-xs font-medium uppercase tracking-wider text-text-muted border-b border-border">
          <span>Metric</span>
          <span className="text-right">Healthy</span>
          <span className="text-right">Impacted</span>
          <span className="text-right">Delta</span>
        </div>

        <StatRow label="Nodes" healthy={healthyNodes} impacted={impactedNodes} />
        <StatRow label="Edges" healthy={healthyEdges} impacted={impactedEdges} />
        <StatRow
          label="Components"
          healthy={healthyComponents}
          impacted={impactedComponents}
        />
      </CardContent>

      {/* Summary callout */}
      <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3">
        <p className="text-sm font-medium text-red-300">
          {result.totalAffected} node{result.totalAffected !== 1 ? 's' : ''}{' '}
          affected across {result.maxDepth + 1} cascade level
          {result.maxDepth !== 0 ? 's' : ''}
        </p>
        <p className="mt-1 text-xs text-red-300/70">
          Scenario: {result.scenario.name}
        </p>
      </div>
    </Card>
  )
}
