import { Blockquote, Button, Text } from '@mantine/core'
import { modals } from '@mantine/modals'
import { IconAlertCircle } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { PageTemplate } from 'src/components/PageTemplate'
import { INDEXEDDB_NAME } from 'src/constants'
import { useNotifications } from 'src/hooks/useNotification'

export function EmergencyFallbackPage() {
  const { withNotifications } = useNotifications()

  const onDeleteDatabaseClick = () => {
    modals.openConfirmModal({
      title: 'Do you really want to delete all data?',
      children: <Text size="sm">Your data cannot be restored afterwards.</Text>,
      labels: { confirm: 'Delete all data', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      closeOnConfirm: true,
      onConfirm: async () => {
        await withNotifications({
          fn: async () => {
            await indexedDB.deleteDatabase(INDEXEDDB_NAME)
          },
          success: { message: 'Database deleted', color: 'green' },
          error: {
            message: 'Failed to reset database!',
            color: 'red',
            icon: <IconAlertCircle />,
          },
        })
        window.location.pathname = '/'
      },
    })
  }

  return (
    <Delayed>
      <PageTemplate title="Error">
        <Blockquote color="red">
          Failed to load the application. This likely means that automatic
          schema migration failed. Please try to reload the page. If the issue
          persists, you may need to reset the database by deleting all data.
        </Blockquote>

        <Button mt="lg" onClick={onDeleteDatabaseClick} color="red">
          Delete all data
        </Button>
      </PageTemplate>
    </Delayed>
  )
}

type Props = {
  children: React.ReactNode
  waitBeforeShow?: number
}

const Delayed = ({ children, waitBeforeShow = 5000 }: Props) => {
  const [isShown, setIsShown] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShown(true)
    }, waitBeforeShow)
    return () => clearTimeout(timer)
  }, [waitBeforeShow])

  return isShown ? children : null
}
