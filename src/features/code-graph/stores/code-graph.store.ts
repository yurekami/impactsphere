import { proxy } from 'comlink'
import { create } from 'zustand'
import { deserializeGraph, type SerializedCodeGraph } from '../lib/graph-serializer'
import { fetchGitHubRepositoryArchive } from '../lib/github-fetcher'
import { extractZipArchive } from '../lib/zip-extractor'
import type { NodeFilter, ParseProgress, RepoMetadata } from '../types'
import type { ParserWorkerApi } from '../workers/parser.messages'
import { useSettingsStore } from '@/stores/settings.store'

type ParseStatus = 'idle' | 'running' | 'success' | 'error'

type ParseSource =
  | { type: 'github'; value: string; token?: string }
  | { type: 'zip'; file: File; name: string; url?: string; branch?: string }

interface CodeGraphState {
  graph: SerializedCodeGraph | null
  selectedNode: string | null
  filters: NodeFilter
  parseStatus: ParseStatus
  parseProgress: ParseProgress
  repoMetadata: RepoMetadata | null
  error: string | null
  parseRepo: (source: ParseSource) => Promise<void>
  selectNode: (nodeId: string | null) => void
  setFilter: (filters: Partial<NodeFilter>) => void
  clearGraph: () => void
}

const defaultFilters: NodeFilter = {
  types: ['file', 'function', 'class', 'module'],
  minCentrality: 0,
  pathGlob: '',
}

const defaultProgress: ParseProgress = {
  phase: 'idle',
  progress: 0,
  current: 'Waiting for repository input',
}

function createParserWorker(): Worker {
  return new Worker(new URL('../workers/parser.worker.ts', import.meta.url), {
    type: 'module',
  })
}

export const useCodeGraphStore = create<CodeGraphState>((set, get) => ({
  graph: null,
  selectedNode: null,
  filters: defaultFilters,
  parseStatus: 'idle',
  parseProgress: defaultProgress,
  repoMetadata: null,
  error: null,

  parseRepo: async (source) => {
    set({
      parseStatus: 'running',
      error: null,
      parseProgress: {
        phase: source.type === 'github' ? 'fetching' : 'extracting',
        progress: 5,
        current:
          source.type === 'github' ? 'Fetching repository metadata from GitHub' : 'Reading ZIP archive',
      },
    })

    try {
      let archive: ArrayBuffer
      let repoName: string
      let repoUrl: string
      let repoBranch: string

      if (source.type === 'github') {
        const corsProxy = useSettingsStore.getState().proxyUrl
        const fetched = await fetchGitHubRepositoryArchive(source.value, {
          token: source.token,
          corsProxy,
        })

        archive = fetched.archive
        repoName = fetched.repoName
        repoUrl = fetched.repoUrl
        repoBranch = fetched.defaultBranch
      } else {
        archive = await source.file.arrayBuffer()
        repoName = source.name
        repoUrl = source.url ?? 'local://zip-upload'
        repoBranch = source.branch ?? 'local'
      }

      set({
        parseProgress: {
          phase: 'extracting',
          progress: 12,
          current: 'Decompressing source archive',
        },
      })

      const extracted = extractZipArchive(archive)

      const worker = createParserWorker()

      try {
        const { wrap } = await import('comlink')
        const parser = wrap<ParserWorkerApi>(worker)

        const result = await parser.analyzeRepository(
          {
            files: Array.from(extracted.files.entries()),
            repo: {
              name: repoName,
              url: repoUrl,
              branch: repoBranch,
            },
          },
          proxy((progress: ParseProgress) => {
            set({ parseProgress: progress })
          }),
        )

        set({
          graph: result.graph,
          repoMetadata: {
            ...result.metadata,
            fileCount: result.metadata.fileCount || extracted.metadata.includedFiles,
          },
          parseStatus: 'success',
          parseProgress: {
            phase: 'completed',
            progress: 100,
            current: 'Repository graph generated successfully',
          },
          selectedNode: null,
        })
      } finally {
        worker.terminate()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to parse repository.'
      set({
        parseStatus: 'error',
        error: message,
        parseProgress: {
          phase: 'error',
          progress: get().parseProgress.progress,
          current: message,
        },
      })
    }
  },

  selectNode: (selectedNode) => set({ selectedNode }),

  setFilter: (filters) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...filters,
      },
    })),

  clearGraph: () =>
    set({
      graph: null,
      selectedNode: null,
      repoMetadata: null,
      parseStatus: 'idle',
      parseProgress: defaultProgress,
      error: null,
    }),
}))

export function useCodeGraphStoreGraph() {
  const serializedGraph = useCodeGraphStore((state) => state.graph)
  return serializedGraph ? deserializeGraph(serializedGraph) : null
}
