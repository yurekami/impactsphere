import type Graph from 'graphology'
import type { CascadeStep, Scenario, SimulationResult } from '../types'

/**
 * Test whether a graph node matches a scenario's affected-vendor keywords.
 *
 * Matching is case-insensitive against the node key AND its `label` / `path`
 * attributes (the fields every code-graph node carries).
 */
function nodeMatchesScenario(
  graph: Graph,
  nodeId: string,
  scenario: Scenario,
): boolean {
  const attributes = graph.getNodeAttributes(nodeId) as {
    label?: string
    path?: string
  }

  const haystack = [
    nodeId,
    attributes.label ?? '',
    attributes.path ?? '',
  ]
    .join(' ')
    .toLowerCase()

  const keywords = [
    ...scenario.affectedVendors,
    ...scenario.affectedRegions,
  ]

  return keywords.some((keyword) => haystack.includes(keyword.toLowerCase()))
}

/**
 * Detect orphaned nodes — nodes whose *every* inbound neighbour has been
 * removed and that therefore lost all their dependency sources.
 *
 * Nodes that originally had zero inbound neighbours are never considered
 * orphaned because they were always self-standing.
 */
function findOrphanedNodes(
  impacted: Graph,
  originalInboundCounts: Map<string, number>,
): string[] {
  const orphans: string[] = []

  impacted.forEachNode((nodeId) => {
    const originalInbound = originalInboundCounts.get(nodeId) ?? 0
    if (originalInbound === 0) return          // was already a root
    if (impacted.inDegree(nodeId) === 0) {
      orphans.push(nodeId)
    }
  })

  return orphans
}

/**
 * Count weakly-connected components via BFS over all neighbours.
 */
export function countConnectedComponents(graph: Graph): number {
  const visited = new Set<string>()
  let components = 0

  for (const node of graph.nodes()) {
    if (visited.has(node)) continue
    components += 1

    const queue = [node]
    visited.add(node)

    while (queue.length > 0) {
      const current = queue.shift()!
      for (const neighbor of graph.neighbors(current)) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          queue.push(neighbor)
        }
      }
    }
  }

  return components
}

/**
 * Run a what-if simulation against a code-dependency graph.
 *
 * 1. Clone the graph so the original stays untouched.
 * 2. Find every node that matches one of the scenario's vendor/region keywords.
 * 3. Remove them (step 0 — the initial impact).
 * 4. Iteratively remove nodes that lost *all* of their inbound dependencies
 *    until no more orphans appear (cascade propagation).
 */
export function runScenario(
  scenario: Scenario,
  graph: Graph,
): SimulationResult {
  const impacted = graph.copy()
  const cascadeSteps: CascadeStep[] = []

  // Snapshot of original inbound counts *before* any removal.
  const originalInboundCounts = new Map<string, number>()
  graph.forEachNode((nodeId) => {
    originalInboundCounts.set(nodeId, graph.inDegree(nodeId))
  })

  // --- Step 0: direct impact ------------------------------------------------
  const directlyAffected: string[] = impacted
    .nodes()
    .filter((nodeId) => nodeMatchesScenario(impacted, nodeId, scenario))

  if (directlyAffected.length > 0) {
    for (const nodeId of directlyAffected) {
      impacted.dropNode(nodeId)
    }

    cascadeSteps.push({
      step: 0,
      removedNodes: directlyAffected,
      reason: `Direct match for: ${scenario.affectedVendors.join(', ')}`,
    })
  }

  // --- Cascade propagation ---------------------------------------------------
  let depth = 1
  const MAX_CASCADE_DEPTH = 50

  while (depth <= MAX_CASCADE_DEPTH) {
    const orphans = findOrphanedNodes(impacted, originalInboundCounts)

    if (orphans.length === 0) break

    for (const nodeId of orphans) {
      impacted.dropNode(nodeId)
    }

    cascadeSteps.push({
      step: depth,
      removedNodes: orphans,
      reason: `Lost all dependency sources (cascade depth ${depth})`,
    })

    depth += 1
  }

  const totalAffected = cascadeSteps.reduce(
    (sum, step) => sum + step.removedNodes.length,
    0,
  )

  return {
    scenario,
    cascadeSteps,
    totalAffected,
    maxDepth: cascadeSteps.length > 0
      ? cascadeSteps[cascadeSteps.length - 1].step
      : 0,
  }
}
