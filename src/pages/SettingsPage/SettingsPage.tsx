import { Box, Stack } from '@mantine/core'
import { PageTemplate } from 'src/components/PageTemplate'
import { DangerZone } from 'src/pages/SettingsPage/components/DangerZone'
import { ProfileSettings } from 'src/pages/SettingsPage/components/ProfileSettings'

export function SettingsPage() {
  return (
    <PageTemplate title="Settings">
      <Stack gap="xl">
        <Box>
          <ProfileSettings />
        </Box>

        <Box>
          <DangerZone />
        </Box>
      </Stack>
    </PageTemplate>
  )
}
