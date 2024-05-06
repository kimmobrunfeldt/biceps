import { Box, Stack, Title } from '@mantine/core'
import { PageTemplate } from 'src/components/PageTemplate'
import { DangerZone } from 'src/pages/SettingsPage/components/DangerZone'
import { ImportExportData } from 'src/pages/SettingsPage/components/ImportExportData'
import { ProfileSettings } from 'src/pages/SettingsPage/components/ProfileSettings'
import { SyncData } from 'src/pages/SettingsPage/components/SyncData'

export function SettingsPage() {
  return (
    <PageTemplate title="Settings">
      <Stack gap="xl" mt="md">
        <Box>
          <Title order={2} fz="h3" mb="md">
            Profile
          </Title>
          <ProfileSettings />
        </Box>

        <Box pt="xl">
          <Title order={2} fz="h3" mb="md">
            Sync data
          </Title>

          <SyncData />
        </Box>

        <Box pt="xl">
          <Title order={2} fz="h3" mb="md">
            Import or export data
          </Title>

          <ImportExportData />
        </Box>

        <Box pt="xl">
          <Title mb="lg" order={2} fz="h3">
            Danger zone
          </Title>
          <DangerZone />
        </Box>
      </Stack>
    </PageTemplate>
  )
}
