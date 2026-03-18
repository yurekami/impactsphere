import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export function Layout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <TopBar />
        <main className="mx-auto w-full max-w-7xl flex-1 p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
