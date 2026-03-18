import { create } from 'zustand'
import type { CorrelationResult } from '../types'

export type ImpactStatus = 'idle' | 'computing' | 'done' | 'error'

interface ImpactState {
  correlations: CorrelationResult | null
  liveMode: boolean
  lastRunTime: string | null
  status: ImpactStatus

  setCorrelations: (result: CorrelationResult) => void
  setStatus: (status: ImpactStatus) => void
  toggleLiveMode: () => void
  clearResults: () => void
}

export const useImpactStore = create<ImpactState>((set) => ({
  correlations: null,
  liveMode: false,
  lastRunTime: null,
  status: 'idle',

  setCorrelations: (result) =>
    set({
      correlations: result,
      lastRunTime: result.computedAt,
      status: 'done',
    }),

  setStatus: (status) => set({ status }),

  toggleLiveMode: () =>
    set((state) => ({ liveMode: !state.liveMode })),

  clearResults: () =>
    set({
      correlations: null,
      lastRunTime: null,
      status: 'idle',
    }),
}))
