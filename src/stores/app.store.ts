import { create } from 'zustand'
import { NAV_ITEMS, type NavItemPath } from '@/lib/constants'

type Theme = 'dark'

interface AppStore {
  theme: Theme
  isSidebarCollapsed: boolean
  activePage: NavItemPath
  setTheme: (theme: Theme) => void
  toggleSidebar: () => void
  setActivePage: (page: NavItemPath) => void
}

export const useAppStore = create<AppStore>((set) => ({
  theme: 'dark',
  isSidebarCollapsed: false,
  activePage: NAV_ITEMS[0].path,
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setActivePage: (activePage) => set({ activePage }),
}))
