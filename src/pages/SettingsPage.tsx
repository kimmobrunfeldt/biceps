import {
  Blockquote,
  Box,
  Button,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { hasLength, useForm } from '@mantine/form'
import { modals } from '@mantine/modals'
import { IconAlertCircle, IconAlertTriangle } from '@tabler/icons-react'
import { useDeleteAllData } from 'src/hooks/useDatabase'
import { useNotifications } from 'src/hooks/useNotification'

export function SettingsPage() {
  const { deleteAllData } = useDeleteAllData()
  const { notification, withNotifications } = useNotifications()

  const onDeleteAllClick = () => {
    modals.openConfirmModal({
      title: 'Do you really want to delete all data?',
      children: (
        <Text size="sm">Your data cannot be restored after deletion.</Text>
      ),
      labels: { confirm: 'Delete all data', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      //closeOnConfirm: true,
      onConfirm: async () => {
        // modals.closeAll()
        await withNotifications({
          fn: async () => {
            await deleteAllData()
          },
          loading: { message: 'Deleting data ...', color: 'blue' },
          success: { message: 'All data deleted', color: 'green' },
          error: {
            message: 'Failed to delete data!',
            color: 'red',
            autoClose: 5000,
            icon: <IconAlertCircle />,
          },
        })()
      },
    })
  }

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { firstName: '' },
    validate: {
      firstName: hasLength({ min: 3 }, 'Must be at least 3 characters'),
    },
  })

  async function onSubmit() {
    notification({ message: 'Saving is not yet implemented', color: 'red' })
  }

  return (
    <Stack gap="xl">
      <Box>
        <Title>Settings</Title>
        <form onSubmit={form.onSubmit(onSubmit)}>
          <TextInput
            {...form.getInputProps('firstName')}
            label="Your first name"
            placeholder="Name"
          />
          <Button type="submit" mt="md">
            Save
          </Button>
        </form>
      </Box>

      <Box>
        <Title mb="xl" order={2}>
          Danger zone
        </Title>

        <Blockquote color="red" icon={<IconAlertTriangle />}>
          Beware! The following actions can delete all your data.
        </Blockquote>

        <Button mt="lg" onClick={onDeleteAllClick} color="red">
          Delete all data
        </Button>
      </Box>
    </Stack>
  )
}
