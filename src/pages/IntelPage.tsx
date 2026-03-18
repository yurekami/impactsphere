import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { EmptyState } from '@/components/feedback'
import { PageHeader } from '@/components/layout'
import { IntelBriefView } from '@/features/ai-intel/components/IntelBriefView'
import { BriefHistory } from '@/features/ai-intel/components/BriefHistory'
import { useAIProvider } from '@/features/ai-intel/hooks/useAIProvider'
import { useIntelBrief } from '@/features/ai-intel/hooks/useIntelBrief'
import type { IntelBrief } from '@/features/ai-intel/types'

export default function IntelPage() {
  const { isConfigured } = useAIProvider()
  const { history, clearHistory, content: _content } = useIntelBrief()
  const navigate = useNavigate()

  const handleSelectBrief = useCallback((_brief: IntelBrief) => {
    // Future: load selected brief into the view
  }, [])

  if (!isConfigured) {
    return (
      <section className="space-y-6">
        <PageHeader
          title="Intel"
          description="AI-powered intelligence briefs for your operational landscape."
        />
        <EmptyState
          title="API Key Required"
          description="Configure an OpenAI or Anthropic API key in Settings to generate intelligence briefs."
          actionLabel="Go to Settings"
          onAction={() => navigate('/settings')}
        />
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Intel"
        description="AI-powered intelligence briefs for your operational landscape."
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <IntelBriefView />
        <BriefHistory
          briefs={history}
          onSelect={handleSelectBrief}
          onClear={clearHistory}
        />
      </div>
    </section>
  )
}
