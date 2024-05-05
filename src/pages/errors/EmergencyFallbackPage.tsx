import { Blockquote } from '@mantine/core'
import { DeleteAllDataLink } from 'src/components/DeleteAllDataLink'
import { PageTemplate } from 'src/components/PageTemplate'

export function EmergencyFallbackPage() {
  return (
    <PageTemplate title="Error">
      <Blockquote color="red">
        Failed to load the application. This might mean that automatic schema
        migration failed. Please try to reload the page. If the issue persists,
        you may need to reset the database by deleting all data.
      </Blockquote>

      <DeleteAllDataLink />
    </PageTemplate>
  )
}
