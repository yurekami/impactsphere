import { useMemo } from 'react'
import { useCodeGraphStoreGraph } from '@/features/code-graph/stores/code-graph.store'
import { computeBlastRadius } from '../lib/blast-radius'
import type { BlastRadius } from '../types'

export function useBlastRadius(nodeId: string | null): BlastRadius | null {
  const graph = useCodeGraphStoreGraph()

  return useMemo(() => {
    if (!nodeId || !graph) {
      return null
    }

    return computeBlastRadius(nodeId, graph)
  }, [nodeId, graph])
}
