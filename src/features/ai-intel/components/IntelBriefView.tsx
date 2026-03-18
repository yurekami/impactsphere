import { useState } from 'react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
} from '@/components/ui'
import { useAIProvider } from '../hooks/useAIProvider'
import { useIntelBrief } from '../hooks/useIntelBrief'
import { BRIEF_TYPES, BRIEF_TYPE_LABELS } from '../types'
import type { BriefType } from '../types'
import { StreamingResponse } from './StreamingResponse'

export function IntelBriefView() {
  const [selectedType, setSelectedType] = useState<BriefType>('impact-summary')
  const { providerLabel, isConfigured } = useAIProvider()
  const { generate, content, isStreaming, error } = useIntelBrief()

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Intel Brief</CardTitle>
        <Badge variant={isConfigured ? 'success' : 'warning'}>
          {providerLabel}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex-1 space-y-2">
              <span className="text-xs uppercase tracking-wide text-text-muted">
                Brief type
              </span>
              <Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as BriefType)}
                disabled={isStreaming}
              >
                {BRIEF_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {BRIEF_TYPE_LABELS[type]}
                  </option>
                ))}
              </Select>
            </label>

            <Button
              onClick={() => void generate(selectedType)}
              disabled={isStreaming || !isConfigured}
            >
              {isStreaming ? 'Generating...' : 'Generate'}
            </Button>
          </div>

          {error ? (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          <StreamingResponse content={content} isStreaming={isStreaming} />
        </div>
      </CardContent>
    </Card>
  )
}
