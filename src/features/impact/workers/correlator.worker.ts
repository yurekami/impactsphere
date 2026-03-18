import { expose } from 'comlink'
import { deserializeGraph, type SerializedCodeGraph } from '@/features/code-graph/lib/graph-serializer'
import type { CategorizedEvent } from '@/features/event-stream/types'
import { extractKeywords } from '../lib/keyword-extractor'
import { matchEventsToGraph } from '../lib/code-matcher'
import { scoreMatches } from '../lib/impact-scorer'
import { computeBlastRadius } from '../lib/blast-radius'
import type { CorrelationResult, Match } from '../types'
import type { CorrelateProgress, ProgressCallback } from './correlator.messages'

function reportProgress(
  onProgress: ProgressCallback | undefined,
  progress: CorrelateProgress,
): void {
  onProgress?.(progress)
}

async function correlate(
  events: CategorizedEvent[],
  serializedGraph: SerializedCodeGraph,
  onProgress?: ProgressCallback,
): Promise<CorrelationResult> {
  const graph = deserializeGraph(serializedGraph)

  reportProgress(onProgress, { phase: 'extracting-keywords', percent: 10 })
  const allMatches: Match[] = []

  for (const event of events) {
    const keywords = extractKeywords(event)

    reportProgress(onProgress, { phase: 'matching', percent: 30 })
    const matches = matchEventsToGraph(keywords, graph, event.guid)
    allMatches.push(...matches)
  }

  reportProgress(onProgress, { phase: 'scoring', percent: 60 })
  const scores = scoreMatches(allMatches, events, graph)

  reportProgress(onProgress, { phase: 'blast-radius', percent: 80 })
  const blastRadii = allMatches.map((match) => computeBlastRadius(match.nodeId, graph))

  reportProgress(onProgress, { phase: 'done', percent: 100 })

  return {
    matches: allMatches,
    scores,
    blastRadii,
    computedAt: new Date().toISOString(),
  }
}

const workerApi = { correlate }

expose(workerApi)
