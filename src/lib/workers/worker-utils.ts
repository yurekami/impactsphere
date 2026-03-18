import { wrap, type Remote } from 'comlink'

export interface WorkerController<TProxy extends object> {
  proxy: Remote<TProxy>
  terminate: () => void
}

export function createWorkerProxy<TProxy extends object>(
  buildWorker: () => Worker,
): WorkerController<TProxy> {
  const worker = buildWorker()
  const proxy = wrap<TProxy>(worker)

  return {
    proxy,
    terminate: () => worker.terminate(),
  }
}
