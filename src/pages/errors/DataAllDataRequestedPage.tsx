import { Blockquote, Box, Flex, Text } from '@mantine/core'
import { modals } from '@mantine/modals'
import { IconChevronLeft, IconX } from '@tabler/icons-react'
import { deleteDB } from 'idb'
import { useEffect } from 'react'
import { PageTemplate } from 'src/components/PageTemplate'
import { INDEXEDDB_NAME } from 'src/constants'
import { useNotifications } from 'src/hooks/useNotification'
import { routes } from 'src/routes'
import { sleep } from 'src/utils/utils'

export function DeleteAllDataRequestedPage() {
  const { notification, withNotifications } = useNotifications()

  useEffect(() => {
    modals.openConfirmModal({
      id: 'delete-all-data',
      title: 'Confirm data deletion',
      children: (
        <Text size="sm">
          Do you really want to delete all data? Your data cannot be restored
          afterwards.
        </Text>
      ),
      labels: { confirm: 'Delete all data', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      closeOnConfirm: true,
      onConfirm: async () => {
        await withNotifications({
          fn: async () => {
            await deleteDB(INDEXEDDB_NAME, {
              blocked: () => {
                notification({
                  message: 'Database deletion blocked. Waiting...',
                  color: 'info',
                })
              },
            })
          },
          success: { message: 'Database deleted', color: 'green' },
          error: {
            message: 'Failed to reset database!',
            color: 'red',
            icon: <IconX />,
          },
        })
        await sleep(800)
        // Refresh at browser level. This should cause a new bootstrap for the app.
        // @ts-expect-error This works and reloads page without query parameter
        window.location = '/'
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <PageTemplate title="Data deletion requested">
      <Blockquote color="yellow">
        Data deletion requested detected via URL parameters.
      </Blockquote>
      <Box mt="lg">
        <a href={routes.index.path}>
          <Flex direction="row" align="center">
            <IconChevronLeft /> Back to Home
          </Flex>
        </a>
      </Box>
    </PageTemplate>
  )
}
