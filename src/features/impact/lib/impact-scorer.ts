import type Graph from 'graphology'
import type { CategorizedEvent, Severity } from '@/features/event-stream/types'
import type { GraphNode } from '@/features/code-graph/types'
import type { ImpactScore, Match } from '../types'

const SEVERITY_WEIGHTS: Record<Severity, number> = {
  critical: 1.0,
  high: 0.75,
  medium: 0.5,
  low: 0.25,
}

function computeRecencyDecay(pubDate: string): number {
  const eventTime = new Date(pubDate).getTime()
  const now = Date.now()
  const ageHours = Math.max(0, (now - eventTime) / (1000 * 60 * 60))
  return Math.exp(-ageHours / 48)
}

function computeEventSeverity(event: CategorizedEvent): number {
  const weight = SEVERITY_WEIGHTS[event.severity] ?? 0.25
  const decay = computeRecencyDecay(event.pubDate)
  return weight * decay
}

function computeNodeCentrality(graph: Graph, nodeId: string): number {
  if (!graph.hasNode(nodeId)) return 0.5
  const attrs = graph.getNodeAttributes(nodeId) as GraphNode
  return attrs.betweenness ?? 0.5
}

function computeExposureScore(graph: Graph, nodeId: string): number {
  if (!graph.hasNode(nodeId)) return 0
  const totalNodes = graph.order
  if (totalNodes === 0) return 0
  const dependentCount = graph.inboundNeighbors(nodeId).length
  return dependentCount / totalNodes
}

export function scoreMatches(
  matches: Match[],
  events: CategorizedEvent[],
  graph: Graph,
): ImpactScore[] {
  const eventByGuid = new Map<string, CategorizedEvent>(
    events.map((e) => [e.guid, e]),
  )

  return matches.map((match) => {
    const event = eventByGuid.get(match.eventId)

    const eventSeverity = event ? computeEventSeverity(event) : 0
    const nodeCentrality = computeNodeCentrality(graph, match.nodeId)
    const exposureScore = computeExposureScore(graph, match.nodeId)

    const rawScore = eventSeverity * nodeCentrality * exposureScore * 100
    const score = Math.min(100, Math.round(rawScore * 100) / 100)

    return {
      matchId: match.id,
      score,
      eventSeverity: Math.round(eventSeverity * 1000) / 1000,
      nodeCentrality: Math.round(nodeCentrality * 1000) / 1000,
      exposureScore: Math.round(exposureScore * 1000) / 1000,
    }
  })
}
