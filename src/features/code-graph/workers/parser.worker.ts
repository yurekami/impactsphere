import { expose } from 'comlink'
import { extractCallEdges } from '../lib/call-chain-extractor'
import { runGraphAlgorithms } from '../lib/graph-algorithms'
import { buildCodeGraph } from '../lib/graph-builder'
import { serializeGraph } from '../lib/graph-serializer'
import { parseTsConfigPaths, resolveImports } from '../lib/import-resolver'
import { parseTypeScriptFiles } from '../lib/ts-parser'
import type { ParseProgress } from '../types'
import type {
  ParserWorkerApi,
  ParserWorkerInput,
  ParserWorkerResult,
  ProgressCallback,
} from './parser.messages'

function progress(
  callback: ProgressCallback | undefined,
  update: ParseProgress,
): void {
  if (!callback) {
    return
  }

  callback(update)
}

async function analyzeRepository(
  input: ParserWorkerInput,
  onProgress?: ProgressCallback,
): Promise<ParserWorkerResult> {
  const fileMap = new Map<string, string>(input.files)

  progress(onProgress, {
    phase: 'parsing',
    progress: 20,
    current: 'Parsing TypeScript files',
  })
  const parsedFiles = parseTypeScriptFiles(fileMap)

  progress(onProgress, {
    phase: 'resolving-imports',
    progress: 40,
    current: 'Resolving import graph',
  })
  const tsConfigPaths = parseTsConfigPaths(fileMap)
  const resolvedImports = resolveImports(parsedFiles, {
    fileMap,
    tsConfigPaths,
  })

  progress(onProgress, {
    phase: 'extracting-calls',
    progress: 60,
    current: 'Extracting call chains',
  })
  const callEdges = extractCallEdges(parsedFiles)

  progress(onProgress, {
    phase: 'building-graph',
    progress: 80,
    current: 'Building graph model',
  })
  const graph = buildCodeGraph({
    parsedFiles,
    resolvedImports,
    callEdges,
  })

  progress(onProgress, {
    phase: 'running-metrics',
    progress: 92,
    current: 'Computing graph metrics',
  })
  runGraphAlgorithms(graph)

  progress(onProgress, {
    phase: 'completed',
    progress: 100,
    current: 'Analysis complete',
  })

  return {
    graph: serializeGraph(graph),
    metadata: {
      name: input.repo.name,
      url: input.repo.url,
      branch: input.repo.branch,
      fileCount: parsedFiles.length,
      analyzedAt: new Date().toISOString(),
    },
  }
}

const workerApi: ParserWorkerApi = {
  analyzeRepository,
}

expose(workerApi)
