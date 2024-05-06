import { Box, Button, Flex, Text } from '@mantine/core'
import { IMPORT_DATA_QUERY_PARAM } from 'src/constants'
import {
  downloadAsExportFile,
  exportBicepsData,
} from 'src/utils/indexedDbBackup'

export function ImportExportData() {
  const importDataUrl = `/?${IMPORT_DATA_QUERY_PARAM}=true`

  async function onExportDataClick() {
    const blob = await exportBicepsData()
    downloadAsExportFile('biceps.json', blob)
  }

  return (
    <Box>
      <Text maw={650}>
        Data export file contains all your data including settings, products,
        recipes, and weekly schedule.
      </Text>

      <Flex align="center" gap="xs">
        <a href={importDataUrl}>
          <Button mt="md" variant="default">
            Import data
          </Button>
        </a>
        <Button mt="md" onClick={onExportDataClick} variant="default">
          Export data
        </Button>
      </Flex>
    </Box>
  )
}
