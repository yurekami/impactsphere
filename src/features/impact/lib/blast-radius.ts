import type Graph from 'graphology'
import type { GraphNode } from '@/features/code-graph/types'
import type { BlastRadius } from '../types'

export function computeBlastRadius(
  nodeId: string,
  graph: Graph,
  maxDepth = 3,
): BlastRadius {
  if (!graph.hasNode(nodeId)) {
    return {
      rootNodeId: nodeId,
      affectedNodes: [],
      totalFiles: 0,
      totalFunctions: 0,
      maxDepth: 0,
    }
  }

  const visited = new Map<string, number>()
  visited.set(nodeId, 0)

  const queue: Array<{ node: string; distance: number }> = [
    { node: nodeId, distance: 0 },
  ]

  while (queue.length > 0) {
    const current = queue.shift()
    if (!current || current.distance >= maxDepth) continue

    const nextDistance = current.distance + 1
    const dependents = graph.inboundNeighbors(current.node)

    for (const neighbor of dependents) {
      if (!visited.has(neighbor)) {
        visited.set(neighbor, nextDistance)
        queue.push({ node: neighbor, distance: nextDistance })
      }
    }
  }

  // Exclude root node from affected list
  visited.delete(nodeId)

  const affectedNodes: Array<{ nodeId: string; distance: number }> = []
  let totalFiles = 0
  let totalFunctions = 0
  let reachedMaxDepth = 0

  for (const [affectedId, distance] of visited) {
    affectedNodes.push({ nodeId: affectedId, distance })
    reachedMaxDepth = Math.max(reachedMaxDepth, distance)

    if (graph.hasNode(affectedId)) {
      const attrs = graph.getNodeAttributes(affectedId) as GraphNode
      if (attrs.type === 'file') totalFiles++
      if (attrs.type === 'function') totalFunctions++
    }
  }

  return {
    rootNodeId: nodeId,
    affectedNodes: affectedNodes.sort((a, b) => a.distance - b.distance),
    totalFiles,
    totalFunctions,
    maxDepth: reachedMaxDepth,
  }
}
