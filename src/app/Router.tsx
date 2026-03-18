import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { LoadingSpinner } from '@/components/feedback'
import { Layout } from '@/components/layout'
import { NAV_ITEMS, type NavItemPath } from '@/lib/constants'
import { useAppStore } from '@/stores/app.store'

const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const CodeGraphPage = lazy(() => import('@/pages/CodeGraphPage'))
const EventsPage = lazy(() => import('@/pages/EventsPage'))
const GlobePage = lazy(() => import('@/pages/GlobePage'))
const ImpactPage = lazy(() => import('@/pages/ImpactPage'))
const SimulatorPage = lazy(() => import('@/pages/SimulatorPage'))
const IntelPage = lazy(() => import('@/pages/IntelPage'))
const AlertsPage = lazy(() => import('@/pages/AlertsPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))

function RouteStateSync() {
  const location = useLocation()
  const setActivePage = useAppStore((state) => state.setActivePage)

  useEffect(() => {
    const matchedItem = NAV_ITEMS.find((item) => item.path === location.pathname)

    if (matchedItem) {
      setActivePage(matchedItem.path as NavItemPath)
    }
  }, [location.pathname, setActivePage])

  return null
}

export function AppRouter() {
  return (
    <>
      <RouteStateSync />
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <LoadingSpinner size="lg" label="Loading mission module" />
          </div>
        }
      >
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/codegraph" element={<CodeGraphPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/globe" element={<GlobePage />} />
            <Route path="/impact" element={<ImpactPage />} />
            <Route path="/simulator" element={<SimulatorPage />} />
            <Route path="/intel" element={<IntelPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  )
}
