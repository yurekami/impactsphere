import Graph from 'graphology'
import betweennessCentrality from 'graphology-metrics/centrality/betweenness'
import degreeMetrics from 'graphology-metrics/centrality/degree'
import pageRank from 'graphology-metrics/centrality/pagerank'

export interface NodeCentrality {
  betweenness: number
  pageRank: number
  degree: number
  composite: number
}

function computeConnectedComponents(graph: Graph): Map<string, number> {
  const componentByNode = new Map<string, number>()
  const visited = new Set<string>()
  let componentId = 0

  for (const node of graph.nodes()) {
    if (visited.has(node)) {
      continue
    }

    const queue = [node]
    visited.add(node)

    while (queue.length > 0) {
      const current = queue.shift()

      if (!current) {
        continue
      }

      componentByNode.set(current, componentId)

      const neighbors = new Set<string>([
        ...graph.outboundNeighbors(current),
        ...graph.inboundNeighbors(current),
      ])

      for (const neighbor of neighbors) {
        if (visited.has(neighbor)) {
          continue
        }
        visited.add(neighbor)
        queue.push(neighbor)
      }
    }

    componentId += 1
  }

  return componentByNode
}

export function runGraphAlgorithms(graph: Graph): void {
  const betweenness = betweennessCentrality(graph)
  const pageRanks = pageRank(graph)
  const degree = degreeMetrics.degreeCentrality(graph)
  const components = computeConnectedComponents(graph)

  graph.forEachNode((node, attributes) => {
    const nodeBetweenness = betweenness[node] ?? 0
    const nodePageRank = pageRanks[node] ?? 0
    const nodeDegree = degree[node] ?? 0
    const composite = nodeBetweenness * 0.4 + nodePageRank * 0.4 + nodeDegree * 0.2

    graph.mergeNodeAttributes(node, {
      ...attributes,
      betweenness: nodeBetweenness,
      pageRank: nodePageRank,
      degreeCentrality: nodeDegree,
      componentId: components.get(node) ?? -1,
      centrality: composite,
    })
  })
}

export function getNodeCentrality(graph: Graph, nodeId: string): NodeCentrality | null {
  if (!graph.hasNode(nodeId)) {
    return null
  }

  const attributes = graph.getNodeAttributes(nodeId) as {
    betweenness?: number
    pageRank?: number
    degreeCentrality?: number
    centrality?: number
  }

  return {
    betweenness: attributes.betweenness ?? 0,
    pageRank: attributes.pageRank ?? 0,
    degree: attributes.degreeCentrality ?? 0,
    composite: attributes.centrality ?? 0,
  }
}

export function getTopNodes(graph: Graph, n: number): Array<{ id: string; score: number }> {
  return graph
    .nodes()
    .map((nodeId) => ({
      id: nodeId,
      score: (graph.getNodeAttribute(nodeId, 'centrality') as number | undefined) ?? 0,
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, n)
}

export function getSubgraph(graph: Graph, nodeId: string, depth: number): Graph {
  const subgraph = new Graph({ type: 'directed', multi: true })

  if (!graph.hasNode(nodeId)) {
    return subgraph
  }

  const discovered = new Set<string>([nodeId])
  const queue: Array<{ node: string; distance: number }> = [{ node: nodeId, distance: 0 }]

  while (queue.length > 0) {
    const current = queue.shift()

    if (!current) {
      continue
    }

    const attributes = graph.getNodeAttributes(current.node)
    if (!subgraph.hasNode(current.node)) {
      subgraph.addNode(current.node, attributes)
    }

    if (current.distance >= depth) {
      continue
    }

    const neighbors = new Set<string>([
      ...graph.outboundNeighbors(current.node),
      ...graph.inboundNeighbors(current.node),
    ])

    for (const neighbor of neighbors) {
      if (!subgraph.hasNode(neighbor)) {
        subgraph.addNode(neighbor, graph.getNodeAttributes(neighbor))
      }

      if (!discovered.has(neighbor)) {
        discovered.add(neighbor)
        queue.push({ node: neighbor, distance: current.distance + 1 })
      }
    }
  }

  graph.forEachEdge((edge, attributes, source, target) => {
    if (subgraph.hasNode(source) && subgraph.hasNode(target) && !subgraph.hasEdge(edge)) {
      subgraph.addDirectedEdgeWithKey(edge, source, target, attributes)
    }
  })

  return subgraph
}
