import { useMemo, useState, type DragEvent } from 'react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@/components/ui'
import { cn } from '@/lib/utils/cn'

interface RepoInputProps {
  isBusy: boolean
  onAnalyzeGitHub: (repository: string) => Promise<void>
  onAnalyzeZip: (file: File) => Promise<void>
}

export function RepoInput({ isBusy, onAnalyzeGitHub, onAnalyzeZip }: RepoInputProps) {
  const [repoUrl, setRepoUrl] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)

  const disabled = useMemo(() => isBusy || !repoUrl.trim(), [isBusy, repoUrl])

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(false)

    const file = event.dataTransfer.files.item(0)

    if (!file) {
      return
    }

    await onAnalyzeZip(file)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Repository Analysis Input</CardTitle>
        <CardDescription>
          Paste a GitHub repository URL or drop a ZIP archive to generate the code graph.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wide text-text-muted" htmlFor="repo-url">
            GitHub Repository
          </label>
          <Input
            id="repo-url"
            value={repoUrl}
            onChange={(event) => setRepoUrl(event.target.value)}
            placeholder="github.com/owner/repo or owner/repo"
            disabled={isBusy}
          />
        </div>
        <Button disabled={disabled} onClick={() => onAnalyzeGitHub(repoUrl.trim())}>
          Analyze
        </Button>
      </CardContent>

      <CardContent>
        <div
          onDragOver={(event) => {
            event.preventDefault()
            setIsDragOver(true)
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            'rounded-lg border border-dashed border-border bg-surface/50 p-6 text-center text-sm text-text-muted transition',
            isDragOver && 'border-accent text-text',
          )}
        >
          Drag and drop a repository ZIP file here
        </div>
      </CardContent>
    </Card>
  )
}
