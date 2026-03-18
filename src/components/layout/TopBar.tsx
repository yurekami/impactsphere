import { Button, Input } from '@/components/ui'
import { useAppStore } from '@/stores/app.store'

export function TopBar() {
  const toggleSidebar = useAppStore((state) => state.toggleSidebar)

  return (
    <div className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-surface/85 px-5 backdrop-blur">
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={toggleSidebar}>
          Menu
        </Button>
        <div className="hidden w-72 lg:block">
          <Input placeholder="Search repositories, events, intel..." />
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <span className="hidden sm:inline">Live intelligence stream</span>
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
      </div>
    </div>
  )
}
