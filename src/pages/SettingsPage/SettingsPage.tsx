import { Box, Stack } from '@mantine/core'
import { DangerZone } from 'src/pages/SettingsPage/components/DangerZone'
import { ProfileSettings } from 'src/pages/SettingsPage/components/ProfileSettings'

export function SettingsPage() {
  return (
    <Stack gap="xl">
      <Box>
        <ProfileSettings />
      </Box>

      <Box>
        <DangerZone />
      </Box>
    </Stack>
  )
}
