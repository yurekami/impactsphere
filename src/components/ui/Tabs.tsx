import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type PropsWithChildren,
} from 'react'
import { cn } from '@/lib/utils/cn'

interface TabsContextValue {
  activeTab: string
  setActiveTab: (tabId: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

interface TabsProps extends PropsWithChildren {
  defaultTab: string
}

export function Tabs({ defaultTab, children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  const value = useMemo(
    () => ({
      activeTab,
      setActiveTab,
    }),
    [activeTab],
  )

  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>
}

export function TabsList({ className, children }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn('inline-flex rounded-lg border border-border bg-surface p-1', className)}>
      {children}
    </div>
  )
}

interface TabsTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

export function TabsTrigger({ value, className, children, ...props }: TabsTriggerProps) {
  const context = useContext(TabsContext)

  if (!context) {
    throw new Error('TabsTrigger must be used within Tabs')
  }

  const isActive = context.activeTab === value

  return (
    <button
      className={cn(
        'rounded-md px-3 py-1.5 text-sm transition',
        isActive ? 'bg-accent text-white' : 'text-text-muted hover:text-text',
        className,
      )}
      onClick={() => context.setActiveTab(value)}
      {...props}
    >
      {children}
    </button>
  )
}

interface TabsContentProps extends PropsWithChildren {
  value: string
  className?: string
}

export function TabsContent({ value, className, children }: TabsContentProps) {
  const context = useContext(TabsContext)

  if (!context) {
    throw new Error('TabsContent must be used within Tabs')
  }

  if (context.activeTab !== value) {
    return null
  }

  return <div className={cn('pt-4', className)}>{children}</div>
}
