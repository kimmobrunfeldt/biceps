import { PageTemplate } from 'src/components/PageTemplate'
import { DailyStats } from 'src/pages/IndexPage/components/DailyStats'

export function IndexPage() {
  return (
    <PageTemplate title="Home">
      <DailyStats />
    </PageTemplate>
  )
}
