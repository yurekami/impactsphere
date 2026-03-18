import { EmptyState } from '@/components/feedback'
import { PageHeader } from '@/components/layout'

interface StubPageProps {
  title: string
  description: string
}

export function StubPage({ title, description }: StubPageProps) {
  return (
    <section className="space-y-6">
      <PageHeader title={title} description={description} />
      <EmptyState
        title={`${title} is scaffolded`}
        description="This module is wired into the app shell and ready for feature implementation in Phase 1."
      />
    </section>
  )
}
