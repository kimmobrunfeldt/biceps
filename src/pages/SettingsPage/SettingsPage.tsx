import { Box, Stack } from '@mantine/core'
import { PageTemplate } from 'src/components/PageTemplate'
import { useSqlite } from 'src/hooks/useSqlite'
import Peers from 'src/pages/SettingsPage/Peers'
import { DangerZone } from 'src/pages/SettingsPage/components/DangerZone'
import { ProfileSettings } from 'src/pages/SettingsPage/components/ProfileSettings'

export function SettingsPage() {
  const ctx = useSqlite()
  return (
    <PageTemplate title="Settings">
      <Stack gap="xl" mt="md">
        <Box>
          <ProfileSettings />
        </Box>

        <Box>
          <DangerZone />
        </Box>
      </Stack>

      <Box mt="xl">
        <Peers />
        <div
          className="siteid"
          onClick={() => {
            navigator.clipboard.writeText(ctx.siteid)
          }}
        >
          PeerID: {ctx.siteid}
        </div>
      </Box>
    </PageTemplate>
  )
}
