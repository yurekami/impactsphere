import { useCallback, useRef, useState } from 'react'
import { useEventStreamStore } from '@/features/event-stream/stores/event-stream.store'
import { useImpactStore } from '@/features/impact/stores/impact.store'
import { streamOpenAI } from '../lib/openai-client'
import { streamAnthropic } from '../lib/anthropic-client'
import { buildContext } from '../lib/context-builder'
import { getPrompt } from '../lib/prompt-templates'
import { useAIProvider } from './useAIProvider'
import type { BriefType, IntelBrief } from '../types'

const HISTORY_KEY = 'impactsphere-intel-history'
const MAX_HISTORY = 20

function loadHistory(): IntelBrief[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    return JSON.parse(raw) as IntelBrief[]
  } catch {
    return []
  }
}

function saveHistory(briefs: IntelBrief[]): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(briefs.slice(0, MAX_HISTORY)))
}

interface UseIntelBriefReturn {
  generate: (type: BriefType) => Promise<void>
  content: string
  isStreaming: boolean
  error: string | null
  history: IntelBrief[]
  clearHistory: () => void
}

export function useIntelBrief(): UseIntelBriefReturn {
  const [content, setContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<IntelBrief[]>(loadHistory)
  const abortRef = useRef(false)

  const { provider, apiKey, isConfigured } = useAIProvider()

  const generate = useCallback(
    async (type: BriefType) => {
      if (!isConfigured) {
        setError(`No API key configured for ${provider}. Set it in Settings.`)
        return
      }

      abortRef.current = false
      setContent('')
      setError(null)
      setIsStreaming(true)

      try {
        const events = useEventStreamStore.getState().events
        const correlations = useImpactStore.getState().correlations
        const matches = correlations?.matches ?? []
        const scores = correlations?.scores ?? []

        const context = buildContext(events, scores, matches)
        const { system, user } = getPrompt(type, context)

        const stream =
          provider === 'openai'
            ? streamOpenAI(apiKey, system, user)
            : streamAnthropic(apiKey, system, user)

        let accumulated = ''

        for await (const delta of stream) {
          if (abortRef.current) break
          accumulated += delta
          setContent(accumulated)
        }

        if (!abortRef.current && accumulated.length > 0) {
          const brief: IntelBrief = {
            id: crypto.randomUUID(),
            type,
            content: accumulated,
            createdAt: new Date().toISOString(),
            provider,
          }

          setHistory((prev) => {
            const next = [brief, ...prev].slice(0, MAX_HISTORY)
            saveHistory(next)
            return next
          })
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to generate brief'
        setError(message)
      } finally {
        setIsStreaming(false)
      }
    },
    [provider, apiKey, isConfigured],
  )

  const clearHistory = useCallback(() => {
    setHistory([])
    localStorage.removeItem(HISTORY_KEY)
  }, [])

  return { generate, content, isStreaming, error, history, clearHistory }
}
