import { Box, Stack, Title } from '@mantine/core'
import { PageTemplate } from 'src/components/PageTemplate'
import { useSqlite } from 'src/hooks/useSqlite'
import { DangerZone } from 'src/pages/SettingsPage/components/DangerZone'
import { ProfileSettings } from 'src/pages/SettingsPage/components/ProfileSettings'
import { SyncData } from 'src/pages/SettingsPage/components/SyncData'

export function SettingsPage() {
  const ctx = useSqlite()
  return (
    <PageTemplate title="Settings">
      <Stack gap="xl" mt="md">
        <Box>
          <Title order={2} fz="xl" mb="md">
            Profile
          </Title>
          <ProfileSettings />
        </Box>

        <Box pt="xl">
          <Title order={2} fz="xl" mb="md">
            Sync data
          </Title>

          <SyncData />
        </Box>

        <Box pt="xl">
          <Title mb="lg" order={2} fz="xl">
            Danger zone
          </Title>
          <DangerZone />
        </Box>
      </Stack>
    </PageTemplate>
  )
}
