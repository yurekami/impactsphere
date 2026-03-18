import { useCallback } from 'react'
import type Graph from 'graphology'
import forceAtlas2 from 'graphology-layout-forceatlas2'

export type GraphLayoutMode = 'forceatlas2' | 'circular' | 'grid'

function assignCircularLayout(graph: Graph): void {
  const nodes = graph.nodes()
  const total = Math.max(nodes.length, 1)

  nodes.forEach((node, index) => {
    const angle = (2 * Math.PI * index) / total
    const radius = 8 + total * 0.6

    graph.mergeNodeAttributes(node, {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    })
  })
}

function assignGridLayout(graph: Graph): void {
  const nodes = graph.nodes()
  const width = Math.ceil(Math.sqrt(nodes.length))

  nodes.forEach((node, index) => {
    const x = index % width
    const y = Math.floor(index / width)

    graph.mergeNodeAttributes(node, {
      x,
      y,
    })
  })
}

function ensureVisualAttributes(graph: Graph): void {
  graph.forEachNode((node, attributes) => {
    const size = Number(attributes.centrality ?? 0)
    graph.mergeNodeAttributes(node, {
      size: Math.max(4, Math.min(18, 4 + size * 40)),
      label: String(attributes.label ?? node),
    })
  })
}

export function useGraphLayout() {
  const applyLayout = useCallback((graph: Graph, mode: GraphLayoutMode) => {
    if (graph.order === 0) {
      return
    }

    if (mode === 'forceatlas2') {
      const settings = forceAtlas2.inferSettings(graph)
      forceAtlas2.assign(graph, {
        iterations: 120,
        settings,
      })
    }

    if (mode === 'circular') {
      assignCircularLayout(graph)
    }

    if (mode === 'grid') {
      assignGridLayout(graph)
    }

    ensureVisualAttributes(graph)
  }, [])

  return { applyLayout }
}
