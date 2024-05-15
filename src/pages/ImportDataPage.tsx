import { Blockquote, Box, Button, Code, Flex, Text } from '@mantine/core'
import { modals } from '@mantine/modals'
import { IconChevronLeft, IconX } from '@tabler/icons-react'
import { useRef } from 'react'
import { PageTemplate } from 'src/components/PageTemplate'
import { DATABASE_EXPORT_FILE_NAME } from 'src/constants'
import { useNotifications } from 'src/hooks/useNotification'
import { routes } from 'src/routes'
import { importBicepsData } from 'src/utils/indexedDbBackup'
import { sleep } from 'src/utils/utils'

export function ImportDataPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const { withNotifications } = useNotifications()

  function onButtonClick() {
    inputRef.current?.click()
  }

  function onImportFileSelected() {
    if (!inputRef.current?.files) return

    const [file] = inputRef.current.files
    if (!file) return

    importJson(file)
  }

  function importJson(file: File) {
    modals.openConfirmModal({
      id: 'import-database',
      title: 'Import database',
      children: (
        <Text size="sm">
          Importing overwrites all existing data. Do you really want to
          continue?
        </Text>
      ),
      labels: { confirm: 'Import data', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      closeOnConfirm: true,
      onConfirm: async () => {
        modals.close('import-data')
        await withNotifications({
          fn: async () => {
            await importBicepsData(file)
          },
          minLoadingNotificationMs: 800,
          loading: { message: 'Importing ...' },
          success: { message: 'Importing done', color: 'green' },
          error: {
            message: 'Failed to import data!',
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
  }

  return (
    <PageTemplate
      title="Database import"
      titleRightSection={
        <a href={routes.index.path}>
          <Flex direction="row" align="center">
            <IconChevronLeft /> Back to Home
          </Flex>
        </a>
      }
    >
      <Blockquote color="yellow">
        Importing a database will overwrite all existing data.
      </Blockquote>

      <Box mt="xl">
        <input
          ref={inputRef}
          type="file"
          id="file"
          accept="application/json"
          style={{ display: 'none' }}
          onChange={onImportFileSelected}
        />
        <Text maw={700}>
          To import, click the button below and select{' '}
          <Code>{DATABASE_EXPORT_FILE_NAME}</Code> export file. If the process
          fails, visit the <a href={routes.index.path}>Home page</a> and come
          back to retry.
        </Text>
        <Button mt="lg" id="file" type="button" onClick={onButtonClick}>
          Import file
        </Button>
      </Box>
      <Box mt="xl"></Box>
    </PageTemplate>
  )
}
