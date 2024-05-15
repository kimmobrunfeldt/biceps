import { Box, Button, Code, Flex, Stack, Text, Title } from '@mantine/core'
import { modals } from '@mantine/modals'
import { IconX } from '@tabler/icons-react'
import { useRef } from 'react'
import {
  DATABASE_EXPORT_FILE_NAME,
  DATA_EXPORT_FILE_NAME,
  IMPORT_DATA_QUERY_PARAM,
} from 'src/constants'
import { useImportUserData, useLazyGetAllUserData } from 'src/hooks/useDatabase'
import { useNotifications } from 'src/hooks/useNotification'
import { downloadAsJsonFile } from 'src/utils/fileDownload'
import {
  downloadAsExportFile,
  exportBicepsData,
} from 'src/utils/indexedDbBackup'

const importDataUrl = `/?${IMPORT_DATA_QUERY_PARAM}=true`

export function ImportExportData() {
  const { getAllUserData } = useLazyGetAllUserData()
  const { importUserData } = useImportUserData()
  const { withNotifications } = useNotifications()
  const inputRef = useRef<HTMLInputElement>(null)

  async function onExportDatabaseClick() {
    const blob = await exportBicepsData()
    downloadAsExportFile(DATABASE_EXPORT_FILE_NAME, blob)
  }

  async function onExportDataClick() {
    const userData = await getAllUserData()
    downloadAsJsonFile(DATA_EXPORT_FILE_NAME, userData)
  }

  function onButtonClick() {
    inputRef.current?.click()
  }

  function importJson(file: File) {
    modals.openConfirmModal({
      id: 'import-user-data',
      title: 'Import user data',
      children: (
        <Text size="sm">
          Importing might overwrite existing data. Do you really want to
          continue?
        </Text>
      ),
      labels: { confirm: 'Import data', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      closeOnConfirm: true,
      onConfirm: async () => {
        modals.close('import-user-data')
        await withNotifications({
          fn: async () => {
            const data = await file.text()
            const parsedData = JSON.parse(data)
            return await importUserData(parsedData)
          },
          minLoadingNotificationMs: 800,
          loading: { message: 'Importing ...' },
          success: (count) => ({
            message: `Imported ${count} data entities`,
            color: 'green',
          }),
          error: {
            message: 'Failed to import data!',
            color: 'red',
            icon: <IconX />,
          },
        })
      },
    })
  }

  function onImportFileSelected() {
    if (!inputRef.current?.files) return

    const [file] = inputRef.current.files
    if (!file) return

    console.log('file selected!', file)
    importJson(file)
  }

  return (
    <Stack gap="xl">
      <Box>
        <Title order={3} fz="h5" mb="sm">
          User content
        </Title>
        <Text maw={650}>
          Recommended way to export. The export file contains only user-created
          data including settings, custom products, recipes, and weekly
          schedule. When importing, select <Code>{DATA_EXPORT_FILE_NAME}</Code>{' '}
          export file.
        </Text>

        <Flex align="center" gap="xs" mt="md">
          <Box>
            <input
              ref={inputRef}
              type="file"
              id="file"
              accept="application/json"
              style={{ display: 'none' }}
              onChange={onImportFileSelected}
            />

            <Button id="file" variant="default" onClick={onButtonClick}>
              Import data
            </Button>
          </Box>

          <Button onClick={onExportDataClick} variant="default">
            Export data
          </Button>
        </Flex>
      </Box>

      <Box>
        <Title order={3} fz="h5" mb="sm">
          Full database
        </Title>
        <Text maw={650}>
          Advanced export mechanism. Database export file contains the whole
          database including the device ID, automatically added products,
          settings, custom products, recipes, and weekly schedule.
        </Text>

        <Flex align="center" gap="xs" mt="md">
          <a href={importDataUrl}>
            <Button variant="default">Import database</Button>
          </a>
          <Button onClick={onExportDatabaseClick} variant="default">
            Export database
          </Button>
        </Flex>
      </Box>
    </Stack>
  )
}
