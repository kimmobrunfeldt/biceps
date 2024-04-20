import { Blockquote, Button, Text, Title } from '@mantine/core'
import { modals } from '@mantine/modals'
import { IconAlertCircle, IconAlertTriangle } from '@tabler/icons-react'
import { useDeleteAllData } from 'src/hooks/useDatabase'
import { useNotifications } from 'src/hooks/useNotification'
import { sleep } from 'src/utils/utils'

export function DangerZone() {
  const { deleteAllData } = useDeleteAllData()
  const { withNotifications } = useNotifications()

  const onDeleteAllClick = () => {
    modals.openConfirmModal({
      title: 'Do you really want to delete all data?',
      children: <Text size="sm">Your data cannot be restored afterwards.</Text>,
      labels: { confirm: 'Delete all data', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      closeOnConfirm: true,
      onConfirm: async () => {
        await withNotifications({
          fn: async () => {
            await deleteAllData()
          },
          minLoadingNotificationMs: 600,
          loading: { message: 'Deleting data ...', color: 'blue' },
          success: { message: 'All data deleted', color: 'green' },
          error: {
            message: 'Failed to delete data!',
            color: 'red',
            autoClose: 5000,
            icon: <IconAlertCircle />,
          },
        })
        await sleep(1000)
        window.location.pathname = '/'
      },
    })
  }

  return (
    <>
      <Title mb="lg" order={2} fz="xl">
        Danger zone
      </Title>

      <Blockquote color="red" icon={<IconAlertTriangle />}>
        Be careful! The following actions need to be handled with care.
      </Blockquote>

      <Button mt="lg" onClick={onDeleteAllClick} color="red">
        Delete all data
      </Button>
    </>
  )
}
