import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '@/lib/constants'
import { cn } from '@/lib/utils/cn'
import { useAppStore } from '@/stores/app.store'

const iconClassName = 'h-4 w-4 shrink-0'

const icons = {
  Dashboard: (
    <svg viewBox="0 0 24 24" fill="none" className={iconClassName}>
      <path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  CodeGraph: (
    <svg viewBox="0 0 24 24" fill="none" className={iconClassName}>
      <circle cx="6" cy="7" r="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="18" cy="6" r="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="17" r="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.7 8L10.4 15M16.3 7.4L13.6 15M8 7h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  Events: (
    <svg viewBox="0 0 24 24" fill="none" className={iconClassName}>
      <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  Globe: (
    <svg viewBox="0 0 24 24" fill="none" className={iconClassName}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 12h18M12 3c3 2.5 3 15.5 0 18M12 3c-3 2.5-3 15.5 0 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  Impact: (
    <svg viewBox="0 0 24 24" fill="none" className={iconClassName}>
      <path d="M4 18h16M6 14l3-4 3 2 4-6 2 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Simulator: (
    <svg viewBox="0 0 24 24" fill="none" className={iconClassName}>
      <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  Intel: (
    <svg viewBox="0 0 24 24" fill="none" className={iconClassName}>
      <path d="M12 3l7 4v5c0 4-2.8 7.5-7 9-4.2-1.5-7-5-7-9V7l7-4z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Alerts: (
    <svg viewBox="0 0 24 24" fill="none" className={iconClassName}>
      <path d="M12 4a5 5 0 0 1 5 5v3l2 3H5l2-3V9a5 5 0 0 1 5-5z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  Settings: (
    <svg viewBox="0 0 24 24" fill="none" className={iconClassName}>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
} as const

export function Sidebar() {
  const isSidebarCollapsed = useAppStore((state) => state.isSidebarCollapsed)

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-screen border-r border-border bg-elevated/85 backdrop-blur lg:block',
        isSidebarCollapsed ? 'w-[84px]' : 'w-[268px]',
      )}
    >
      <div className="flex h-16 items-center border-b border-border px-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20 text-accent-soft">
            IS
          </span>
          {!isSidebarCollapsed ? (
            <div>
              <p className="text-sm font-semibold text-text">ImpactSphere</p>
              <p className="text-xs text-text-muted">Phase 0 Foundation</p>
            </div>
          ) : null}
        </div>
      </div>
      <nav className="space-y-1 p-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex h-10 items-center gap-2 rounded-lg px-3 text-sm transition',
                isActive
                  ? 'bg-accent/20 text-accent-soft'
                  : 'text-text-muted hover:bg-surface hover:text-text',
              )
            }
          >
            {icons[item.label]}
            {!isSidebarCollapsed ? <span>{item.label}</span> : null}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
