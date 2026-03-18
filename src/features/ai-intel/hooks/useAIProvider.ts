import { useMemo } from 'react'
import { useSettingsStore } from '@/stores/settings.store'
import type { AIProvider } from '@/lib/constants'

interface AIProviderState {
  provider: AIProvider
  apiKey: string
  isConfigured: boolean
  providerLabel: string
}

export function useAIProvider(): AIProviderState {
  const provider = useSettingsStore((s) => s.provider)
  const openAiApiKey = useSettingsStore((s) => s.openAiApiKey)
  const anthropicApiKey = useSettingsStore((s) => s.anthropicApiKey)

  return useMemo(() => {
    const apiKey = provider === 'openai' ? openAiApiKey : anthropicApiKey
    const isConfigured = apiKey.trim().length > 0
    const providerLabel = provider === 'openai' ? 'OpenAI' : 'Anthropic'

    return { provider, apiKey, isConfigured, providerLabel }
  }, [provider, openAiApiKey, anthropicApiKey])
}
