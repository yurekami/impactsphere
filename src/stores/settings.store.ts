import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  AI_PROVIDERS,
  DEFAULT_POLLING_INTERVAL,
  type AIProvider,
} from '@/lib/constants'

interface SettingsStore {
  openAiApiKey: string
  anthropicApiKey: string
  proxyUrl: string
  provider: AIProvider
  pollingIntervalSeconds: number
  setOpenAiApiKey: (value: string) => void
  setAnthropicApiKey: (value: string) => void
  setProxyUrl: (value: string) => void
  setProvider: (value: AIProvider) => void
  setPollingIntervalSeconds: (value: number) => void
  reset: () => void
}

const defaultState = {
  openAiApiKey: '',
  anthropicApiKey: '',
  proxyUrl: '',
  provider: AI_PROVIDERS[0],
  pollingIntervalSeconds: DEFAULT_POLLING_INTERVAL,
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaultState,
      setOpenAiApiKey: (openAiApiKey) => set({ openAiApiKey }),
      setAnthropicApiKey: (anthropicApiKey) => set({ anthropicApiKey }),
      setProxyUrl: (proxyUrl) => set({ proxyUrl }),
      setProvider: (provider) => set({ provider }),
      setPollingIntervalSeconds: (pollingIntervalSeconds) =>
        set({ pollingIntervalSeconds }),
      reset: () => set(defaultState),
    }),
    {
      name: 'impactsphere-settings',
      partialize: (state) => ({
        openAiApiKey: state.openAiApiKey,
        anthropicApiKey: state.anthropicApiKey,
        proxyUrl: state.proxyUrl,
        provider: state.provider,
        pollingIntervalSeconds: state.pollingIntervalSeconds,
      }),
    },
  ),
)
