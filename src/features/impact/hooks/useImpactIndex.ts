import { useMemo } from 'react'
import { useImpactStore } from '../stores/impact.store'
import type { ImpactScore } from '../types'

export function useImpactIndex(): ImpactScore[] {
  const correlations = useImpactStore((state) => state.correlations)

  return useMemo(() => {
    if (!correlations) {
      return []
    }

    return [...correlations.scores].sort((a, b) => b.score - a.score)
  }, [correlations])
}
