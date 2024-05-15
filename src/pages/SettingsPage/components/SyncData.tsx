import {
  ActionIcon,
  Blockquote,
  Box,
  CopyButton,
  Flex,
  Text,
  Title,
  Tooltip,
  rem,
} from '@mantine/core'
import { IconCheck, IconCopy } from '@tabler/icons-react'
import { GrayText } from 'src/components/GrayText'
import { APP_BASE_URL, SYNC_QUERY_PARAM } from 'src/constants'
import { useSqlite } from 'src/hooks/useSqlite'
import Peers from 'src/pages/SettingsPage/components/Peers'

export function SyncData() {
  const ctx = useSqlite()
  const syncUrl = `${APP_BASE_URL}?${SYNC_QUERY_PARAM}=${ctx.siteid}`

  return (
    <Box>
      <Blockquote p="md" color="yellow" mb="sm" maw={650}>
        Syncing data between another device might overwrite your current data.
        The most recently updated information will be used in case both devices
        have edited the same fields.
      </Blockquote>

      <Text maw={650}>
        Open the following link in another device to sync data between devices
        (peer-to-peer). Anyone with the link can start syncing. Remember to keep
        this browser open. If the sync is not working, delete all data from the
        other device, import user content there, and retry syncing.
      </Text>

      <GrayText py={6}>{syncUrl}</GrayText>
      <CopyButton value={syncUrl} timeout={2000}>
        {({ copied, copy }) => (
          <Flex
            align="center"
            gap={2}
            onClick={copy}
            style={{ cursor: 'pointer' }}
          >
            <Text c="blue">Copy link</Text>
            <Tooltip
              label={copied ? 'Copied' : 'Copy'}
              withArrow
              position="right"
            >
              <ActionIcon
                color={copied ? 'teal' : 'blue'}
                variant="subtle"
                size="lg"
              >
                {copied ? (
                  <IconCheck style={{ width: rem(16) }} />
                ) : (
                  <IconCopy style={{ width: rem(16) }} />
                )}{' '}
              </ActionIcon>
            </Tooltip>
          </Flex>
        )}
      </CopyButton>

      <Box pt="lg">
        <Title order={3} fz="md" mb="xs">
          Connections
        </Title>
        <Peers />
      </Box>
    </Box>
  )
}
