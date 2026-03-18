import { useMemo } from 'react'
import type Graph from 'graphology'
import Fuse from 'fuse.js'

interface SearchNode {
  id: string
  label: string
  path: string
  type: string
}

export interface GraphSearchResult extends SearchNode {
  score: number
}

export function useGraphSearch(graph: Graph | null, query: string): GraphSearchResult[] {
  const index = useMemo(() => {
    if (!graph) {
      return null
    }

    const rows: SearchNode[] = graph.nodes().map((nodeId) => {
      const attributes = graph.getNodeAttributes(nodeId)
      return {
        id: nodeId,
        label: String(attributes.label ?? nodeId),
        path: String(attributes.path ?? ''),
        type: String(attributes.type ?? 'file'),
      }
    })

    return new Fuse(rows, {
      keys: ['label', 'path', 'type'],
      threshold: 0.35,
      includeScore: true,
    })
  }, [graph])

  return useMemo(() => {
    const trimmed = query.trim()

    if (!index || !trimmed) {
      return []
    }

    return index.search(trimmed).map((result) => ({
      ...result.item,
      score: result.score ?? 0,
    }))
  }, [index, query])
}
