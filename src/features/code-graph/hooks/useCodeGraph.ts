import { useMemo } from 'react'
import Graph from 'graphology'
import { useCodeGraphStore, useCodeGraphStoreGraph } from '../stores/code-graph.store'

function matchesPathGlob(path: string, glob: string): boolean {
  const trimmed = glob.trim()

  if (!trimmed) {
    return true
  }

  const escaped = trimmed
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replaceAll('*', '.*')
  const regex = new RegExp(`^${escaped}$`, 'i')
  return regex.test(path)
}

function filterGraph(graph: Graph, selectedTypes: string[], minCentrality: number, pathGlob: string): Graph {
  const filtered = new Graph({ type: 'directed', multi: true })

  graph.forEachNode((node, attributes) => {
    const nodeType = String(attributes.type)
    const nodePath = String(attributes.path)
    const centrality = Number(attributes.centrality ?? 0)

    if (!selectedTypes.includes(nodeType)) {
      return
    }

    if (centrality < minCentrality) {
      return
    }

    if (!matchesPathGlob(nodePath, pathGlob)) {
      return
    }

    filtered.addNode(node, attributes)
  })

  graph.forEachEdge((edge, attributes, source, target) => {
    if (!filtered.hasNode(source) || !filtered.hasNode(target) || filtered.hasEdge(edge)) {
      return
    }

    filtered.addDirectedEdgeWithKey(edge, source, target, attributes)
  })

  return filtered
}

export function useCodeGraph() {
  const graph = useCodeGraphStoreGraph()
  const selectedNode = useCodeGraphStore((state) => state.selectedNode)
  const filters = useCodeGraphStore((state) => state.filters)
  const parseStatus = useCodeGraphStore((state) => state.parseStatus)
  const parseProgress = useCodeGraphStore((state) => state.parseProgress)
  const repoMetadata = useCodeGraphStore((state) => state.repoMetadata)
  const error = useCodeGraphStore((state) => state.error)
  const parseRepo = useCodeGraphStore((state) => state.parseRepo)
  const selectNode = useCodeGraphStore((state) => state.selectNode)
  const setFilter = useCodeGraphStore((state) => state.setFilter)
  const clearGraph = useCodeGraphStore((state) => state.clearGraph)

  const filteredGraph = useMemo(() => {
    if (!graph) {
      return null
    }

    return filterGraph(graph, filters.types, filters.minCentrality, filters.pathGlob)
  }, [filters.minCentrality, filters.pathGlob, filters.types, graph])

  const selectedNodeAttributes = useMemo(() => {
    if (!filteredGraph || !selectedNode || !filteredGraph.hasNode(selectedNode)) {
      return null
    }

    return filteredGraph.getNodeAttributes(selectedNode) as Record<string, unknown>
  }, [filteredGraph, selectedNode])

  return {
    graph,
    filteredGraph,
    selectedNode,
    selectedNodeAttributes,
    filters,
    parseStatus,
    parseProgress,
    repoMetadata,
    error,
    parseRepo,
    selectNode,
    setFilter,
    clearGraph,
  }
}
