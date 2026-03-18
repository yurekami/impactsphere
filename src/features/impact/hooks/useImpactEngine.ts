import { useCallback, useRef, useState } from 'react'
import { wrap, proxy, type Remote } from 'comlink'
import { useCodeGraphStore } from '@/features/code-graph/stores/code-graph.store'
import { useEventStreamStore } from '@/features/event-stream/stores/event-stream.store'
import { useImpactStore, type ImpactStatus } from '../stores/impact.store'
import type { CorrelatorWorkerApi } from '../workers/correlator.messages'
import type { CorrelateProgress } from '../workers/correlator.messages'

function createCorrelatorWorker(): Worker {
  return new Worker(
    new URL('../workers/correlator.worker.ts', import.meta.url),
    { type: 'module' },
  )
}

interface UseImpactEngineReturn {
  runCorrelation: () => Promise<void>
  status: ImpactStatus
  progress: CorrelateProgress | null
}

export function useImpactEngine(): UseImpactEngineReturn {
  const [progress, setProgress] = useState<CorrelateProgress | null>(null)
  const workerRef = useRef<Worker | null>(null)

  const serializedGraph = useCodeGraphStore((state) => state.graph)
  const events = useEventStreamStore((state) => state.events)
  const status = useImpactStore((state) => state.status)
  const setCorrelations = useImpactStore((state) => state.setCorrelations)
  const setStatus = useImpactStore((state) => state.setStatus)

  const runCorrelation = useCallback(async () => {
    if (!serializedGraph || events.length === 0) {
      return
    }

    setStatus('computing')
    setProgress({ phase: 'extracting-keywords', percent: 0 })

    const worker = createCorrelatorWorker()
    workerRef.current = worker

    try {
      const correlator: Remote<CorrelatorWorkerApi> = wrap(worker)

      const result = await correlator.correlate(
        events,
        serializedGraph,
        proxy((p: CorrelateProgress) => {
          setProgress(p)
        }),
      )

      setCorrelations(result)
      setProgress({ phase: 'done', percent: 100 })
    } catch {
      setStatus('error')
      setProgress(null)
    } finally {
      worker.terminate()
      workerRef.current = null
    }
  }, [serializedGraph, events, setCorrelations, setStatus])

  return { runCorrelation, status, progress }
}
