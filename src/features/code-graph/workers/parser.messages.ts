import type { RepoMetadata, ParseProgress } from '../types'
import type { SerializedCodeGraph } from '../lib/graph-serializer'

export interface ParserWorkerInput {
  files: Array<[string, string]>
  repo: Pick<RepoMetadata, 'name' | 'url' | 'branch'>
}

export interface ParserWorkerResult {
  graph: SerializedCodeGraph
  metadata: RepoMetadata
}

export type ProgressCallback = (progress: ParseProgress) => void

export interface ParserWorkerApi {
  analyzeRepository(
    input: ParserWorkerInput,
    onProgress?: ProgressCallback,
  ): Promise<ParserWorkerResult>
}
