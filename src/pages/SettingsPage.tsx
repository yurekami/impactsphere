import { useMemo } from 'react'
import { PageHeader } from '@/components/layout'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Select,
  Slider,
  Switch,
} from '@/components/ui'
import { AI_PROVIDERS } from '@/lib/constants'
import { useAppStore } from '@/stores/app.store'
import { useSettingsStore } from '@/stores/settings.store'

export default function SettingsPage() {
  const theme = useAppStore((state) => state.theme)
  const isSidebarCollapsed = useAppStore((state) => state.isSidebarCollapsed)
  const toggleSidebar = useAppStore((state) => state.toggleSidebar)

  const {
    openAiApiKey,
    anthropicApiKey,
    proxyUrl,
    provider,
    pollingIntervalSeconds,
    setOpenAiApiKey,
    setAnthropicApiKey,
    setProxyUrl,
    setProvider,
    setPollingIntervalSeconds,
    reset,
  } = useSettingsStore()

  const providerLabel = useMemo(() => {
    if (provider === 'openai') {
      return 'OpenAI GPT models'
    }

    return 'Anthropic Claude models'
  }, [provider])

  return (
    <section className="space-y-6">
      <PageHeader
        title="Settings"
        description="Control model providers, data refresh cadence, and local runtime behavior."
        actions={<Badge variant="neutral">Theme: {theme}</Badge>}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Model Providers</CardTitle>
            <CardDescription>
              API credentials are stored locally via persisted settings store.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-xs uppercase tracking-wide text-text-muted">
                  Active provider
                </span>
                <Select
                  value={provider}
                  onChange={(event) => setProvider(event.target.value as (typeof AI_PROVIDERS)[number])}
                >
                  {AI_PROVIDERS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </Select>
              </label>

              <div className="rounded-lg border border-border bg-surface/70 p-3 text-sm text-text-muted">
                {providerLabel}
              </div>

              <label className="block space-y-2">
                <span className="text-xs uppercase tracking-wide text-text-muted">
                  OpenAI API key
                </span>
                <Input
                  type="password"
                  value={openAiApiKey}
                  placeholder="sk-..."
                  onChange={(event) => setOpenAiApiKey(event.target.value)}
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs uppercase tracking-wide text-text-muted">
                  Anthropic API key
                </span>
                <Input
                  type="password"
                  value={anthropicApiKey}
                  placeholder="sk-ant-..."
                  onChange={(event) => setAnthropicApiKey(event.target.value)}
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs uppercase tracking-wide text-text-muted">
                  Proxy endpoint
                </span>
                <Input
                  value={proxyUrl}
                  placeholder="http://localhost:3000/proxy"
                  onChange={(event) => setProxyUrl(event.target.value)}
                />
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Runtime Controls</CardTitle>
            <CardDescription>
              Tune ingestion cadence and shell behavior for your ops environment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-text-muted">
                  <span>Polling interval</span>
                  <span>{pollingIntervalSeconds}s</span>
                </div>
                <Slider
                  min={15}
                  max={300}
                  step={5}
                  value={pollingIntervalSeconds}
                  onChange={(event) =>
                    setPollingIntervalSeconds(Number.parseInt(event.target.value, 10))
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border bg-surface/70 p-3">
                <div>
                  <p className="text-sm font-medium text-text">Collapse sidebar by default</p>
                  <p className="text-xs text-text-muted">
                    Useful for projector mode and low-width dashboards.
                  </p>
                </div>
                <Switch
                  checked={isSidebarCollapsed}
                  onCheckedChange={() => toggleSidebar()}
                />
              </div>

              <Button variant="secondary" onClick={reset}>
                Reset local settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
