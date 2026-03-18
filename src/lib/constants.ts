export const APP_NAME = 'ImpactSphere'
export const DEFAULT_POLLING_INTERVAL = 60

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/' },
  { label: 'CodeGraph', path: '/codegraph' },
  { label: 'Events', path: '/events' },
  { label: 'Globe', path: '/globe' },
  { label: 'Impact', path: '/impact' },
  { label: 'Simulator', path: '/simulator' },
  { label: 'Intel', path: '/intel' },
  { label: 'Alerts', path: '/alerts' },
  { label: 'Settings', path: '/settings' },
] as const

export type NavItemPath = (typeof NAV_ITEMS)[number]['path']

export const AI_PROVIDERS = ['openai', 'anthropic'] as const
export type AIProvider = (typeof AI_PROVIDERS)[number]
