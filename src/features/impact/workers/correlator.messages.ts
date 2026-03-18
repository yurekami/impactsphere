import type { SerializedCodeGraph } from '@/features/code-graph/lib/graph-serializer'
import type { CategorizedEvent } from '@/features/event-stream/types'
import type { CorrelationResult } from '../types'

export interface CorrelateRequest {
  events: CategorizedEvent[]
  serializedGraph: SerializedCodeGraph
}

export type CorrelatePhase =
  | 'extracting-keywords'
  | 'matching'
  | 'scoring'
  | 'blast-radius'
  | 'done'

export interface CorrelateProgress {
  phase: CorrelatePhase
  percent: number
}

export interface CorrelateResult {
  result: CorrelationResult
}

export type ProgressCallback = (progress: CorrelateProgress) => void

export interface CorrelatorWorkerApi {
  correlate(
    events: CategorizedEvent[],
    serializedGraph: SerializedCodeGraph,
    onProgress?: ProgressCallback,
  ): Promise<CorrelationResult>
}
