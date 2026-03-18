import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils/cn'

interface StreamingResponseProps {
  content: string
  isStreaming: boolean
  className?: string
}

export function StreamingResponse({
  content,
  isStreaming,
  className,
}: StreamingResponseProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current && isStreaming) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [content, isStreaming])

  if (!content && !isStreaming) {
    return (
      <div
        className={cn(
          'flex min-h-48 items-center justify-center rounded-lg border border-border bg-surface/50 text-sm text-text-muted',
          className,
        )}
      >
        Select a brief type and click Generate to get started.
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'max-h-[60vh] min-h-48 overflow-y-auto rounded-lg border border-border bg-surface/50 p-4',
        className,
      )}
    >
      <div className="whitespace-pre-wrap text-sm leading-relaxed text-text">
        {content}
        {isStreaming ? (
          <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-accent" />
        ) : null}
      </div>
    </div>
  )
}
